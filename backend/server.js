/**
 * Digital Legacy Vault - Backend Server
 * Express.js API with Supabase integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const { checkDeadMansSwitches } = require('./cron/deadManSwitch');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Supabase client with service role for backend operations
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Digital Legacy Vault API'
    });
});

// ============================================
// DEAD MAN'S SWITCH ENDPOINTS
// ============================================

/**
 * Create or update Dead Man's Switch configuration
 * POST /api/switch/configure
 */
app.post('/api/switch/configure', async (req, res) => {
    try {
        const {
            userId,
            nomineeEmail,
            nomineeName,
            nomineeRelation,
            personalMessage,
            inactivityPeriodDays
        } = req.body;

        // Validate required fields
        if (!userId || !nomineeEmail) {
            return res.status(400).json({
                error: 'userId and nomineeEmail are required'
            });
        }

        // Check if switch exists
        const { data: existing } = await supabase
            .from('dead_mans_switch')
            .select('id')
            .eq('user_id', userId)
            .single();

        let result;
        if (existing) {
            // Update existing switch
            result = await supabase
                .from('dead_mans_switch')
                .update({
                    nominee_email: nomineeEmail,
                    nominee_name: nomineeName,
                    nominee_relation: nomineeRelation,
                    personal_message: personalMessage,
                    inactivity_period_days: inactivityPeriodDays || 180
                })
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            // Create new switch
            result = await supabase
                .from('dead_mans_switch')
                .insert({
                    user_id: userId,
                    nominee_email: nomineeEmail,
                    nominee_name: nomineeName,
                    nominee_relation: nomineeRelation,
                    personal_message: personalMessage,
                    inactivity_period_days: inactivityPeriodDays || 180,
                    last_check_in: new Date().toISOString()
                })
                .select()
                .single();
        }

        if (result.error) throw result.error;

        res.json({
            success: true,
            switch: result.data,
            message: 'Dead Man\'s Switch configured successfully'
        });

    } catch (error) {
        console.error('Configure switch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Activate/Deactivate Dead Man's Switch
 * POST /api/switch/activate
 */
app.post('/api/switch/activate', async (req, res) => {
    try {
        const { switchId, activate } = req.body;

        const { data, error } = await supabase
            .from('dead_mans_switch')
            .update({
                is_active: activate,
                last_check_in: activate ? new Date().toISOString() : null
            })
            .eq('id', switchId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            switch: data,
            message: activate ? 'Switch activated' : 'Switch deactivated'
        });

    } catch (error) {
        console.error('Activate switch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check-in (I'm Still Here)
 * POST /api/switch/checkin
 */
app.post('/api/switch/checkin', async (req, res) => {
    try {
        const { switchId, ipAddress, userAgent } = req.body;

        // Update last check-in time
        const { data: switchData, error: switchError } = await supabase
            .from('dead_mans_switch')
            .update({
                last_check_in: new Date().toISOString(),
                is_triggered: false // Reset triggered state if they check in
            })
            .eq('id', switchId)
            .select()
            .single();

        if (switchError) throw switchError;

        // Log check-in for audit trail
        await supabase
            .from('check_in_history')
            .insert({
                switch_id: switchId,
                ip_address: ipAddress || req.ip,
                user_agent: userAgent || req.get('User-Agent')
            });

        // Calculate days until trigger
        const daysUntilTrigger = switchData.inactivity_period_days;
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + daysUntilTrigger);

        res.json({
            success: true,
            lastCheckIn: switchData.last_check_in,
            daysUntilTrigger: daysUntilTrigger,
            triggerDate: triggerDate.toISOString(),
            message: 'Check-in successful! Timer reset.'
        });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get switch status
 * GET /api/switch/status/:userId
 */
app.get('/api/switch/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('dead_mans_switch')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
            return res.json({
                configured: false,
                message: 'No Dead Man\'s Switch configured'
            });
        }

        // Calculate days since last check-in
        const lastCheckIn = new Date(data.last_check_in);
        const now = new Date();
        const daysSinceCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));
        const daysUntilTrigger = data.inactivity_period_days - daysSinceCheckIn;

        res.json({
            configured: true,
            isActive: data.is_active,
            isTriggered: data.is_triggered,
            lastCheckIn: data.last_check_in,
            daysSinceCheckIn: daysSinceCheckIn,
            daysUntilTrigger: Math.max(0, daysUntilTrigger),
            inactivityPeriod: data.inactivity_period_days,
            nomineeEmail: data.nominee_email,
            nomineeName: data.nominee_name
        });

    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Send test email to nominee
 * POST /api/switch/test-email
 */
app.post('/api/switch/test-email', async (req, res) => {
    try {
        const { switchId } = req.body;
        const { sendTestEmail } = require('./services/emailService');

        const { data: switchData, error } = await supabase
            .from('dead_mans_switch')
            .select('*')
            .eq('id', switchId)
            .single();

        if (error) throw error;

        await sendTestEmail(switchData);

        // Log the test email
        await supabase
            .from('notification_log')
            .insert({
                switch_id: switchId,
                email_type: 'test',
                recipient_email: switchData.nominee_email
            });

        res.json({
            success: true,
            message: `Test email sent to ${switchData.nominee_email}`
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Nominee access endpoint (when switch is triggered)
 * GET /api/vault/access/:token
 */
app.get('/api/vault/access/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find switch by access token
        const { data: switchData, error: switchError } = await supabase
            .from('dead_mans_switch')
            .select('*, vault_users!inner(*)')
            .eq('access_token', token)
            .eq('is_triggered', true)
            .single();

        if (switchError || !switchData) {
            return res.status(404).json({
                error: 'Invalid or expired access token'
            });
        }

        // Check if token is expired
        if (switchData.token_expires_at && new Date(switchData.token_expires_at) < new Date()) {
            return res.status(410).json({
                error: 'Access token has expired'
            });
        }

        // Get encrypted vault
        const { data: vault, error: vaultError } = await supabase
            .from('encrypted_vaults')
            .select('encrypted_data')
            .eq('user_id', switchData.user_id)
            .single();

        if (vaultError || !vault) {
            return res.status(404).json({
                error: 'Vault not found'
            });
        }

        res.json({
            success: true,
            nomineeName: switchData.nominee_name,
            ownerEmail: switchData.vault_users.email,
            personalMessage: switchData.personal_message,
            encryptedVault: vault.encrypted_data,
            triggeredAt: switchData.triggered_at
        });

    } catch (error) {
        console.error('Vault access error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// VAULT STORAGE ENDPOINTS
// ============================================

/**
 * Store encrypted vault
 * POST /api/vault/store
 */
app.post('/api/vault/store', async (req, res) => {
    try {
        const { userId, encryptedData } = req.body;

        // Upsert encrypted vault
        const { data, error } = await supabase
            .from('encrypted_vaults')
            .upsert({
                user_id: userId,
                encrypted_data: encryptedData,
                last_modified: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            vaultId: data.id,
            message: 'Vault stored securely'
        });

    } catch (error) {
        console.error('Store vault error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CRON JOB SCHEDULER
// ============================================

// Run Dead Man's Switch check daily at midnight (or configured time)
const cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *';
cron.schedule(cronSchedule, async () => {
    console.log('⏰ Running Dead Man\'s Switch check...', new Date().toISOString());
    try {
        await checkDeadMansSwitches(supabase);
        console.log('✅ Dead Man\'s Switch check completed');
    } catch (error) {
        console.error('❌ Dead Man\'s Switch check failed:', error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     🔐 Digital Legacy Vault - Backend Server          ║
╠═══════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                          ║
║  Cron schedule: ${cronSchedule}                       ║
║  Environment: ${process.env.NODE_ENV || 'development'}                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
