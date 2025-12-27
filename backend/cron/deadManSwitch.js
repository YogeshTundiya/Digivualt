/**
 * Dead Man's Switch - Cron Job Handler
 * Checks for inactive users and triggers email notifications
 * 
 * Logic:
 * - Check all active switches
 * - If current_date - last_check_in > inactivity_period_days:
 *   - Mark switch as triggered
 *   - Generate secure access token
 *   - Send email to nominee with vault access link
 * 
 * Warning emails:
 * - 75% of inactivity period: First warning
 * - 90% of inactivity period: Final warning
 */

const { sendWarningEmail, sendFinalWarningEmail, sendTriggeredEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

/**
 * Main function to check all Dead Man's Switches
 * Called by cron job (default: daily at midnight)
 */
async function checkDeadMansSwitches(supabase) {
    console.log('🔍 Checking Dead Man\'s Switches...');

    const now = new Date();

    // Get all active, non-triggered switches
    const { data: switches, error } = await supabase
        .from('dead_mans_switch')
        .select(`
            *,
            vault_users (
                email
            )
        `)
        .eq('is_active', true)
        .eq('is_triggered', false);

    if (error) {
        console.error('Error fetching switches:', error);
        throw error;
    }

    console.log(`📊 Found ${switches?.length || 0} active switches to check`);

    if (!switches || switches.length === 0) {
        return { checked: 0, warned: 0, triggered: 0 };
    }

    let results = {
        checked: switches.length,
        warned: 0,
        finalWarned: 0,
        triggered: 0
    };

    for (const switchData of switches) {
        try {
            const lastCheckIn = new Date(switchData.last_check_in);
            const daysSinceCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));
            const inactivityDays = switchData.inactivity_period_days;
            const percentageElapsed = (daysSinceCheckIn / inactivityDays) * 100;

            console.log(`\n👤 Checking switch ${switchData.id}:`);
            console.log(`   Last check-in: ${lastCheckIn.toISOString()}`);
            console.log(`   Days since check-in: ${daysSinceCheckIn}`);
            console.log(`   Inactivity period: ${inactivityDays} days`);
            console.log(`   Progress: ${percentageElapsed.toFixed(1)}%`);

            // Check if switch should be TRIGGERED (100% elapsed)
            if (daysSinceCheckIn >= inactivityDays) {
                console.log(`   🚨 TRIGGERING switch for ${switchData.nominee_email}`);
                await triggerSwitch(supabase, switchData);
                results.triggered++;
            }
            // Check if FINAL WARNING should be sent (90% elapsed)
            else if (percentageElapsed >= 90) {
                const alreadySent = await hasRecentNotification(supabase, switchData.id, 'final_warning', 7);
                if (!alreadySent) {
                    console.log(`   ⚠️ Sending FINAL WARNING to owner`);
                    await sendFinalWarningNotification(supabase, switchData, daysSinceCheckIn);
                    results.finalWarned++;
                }
            }
            // Check if FIRST WARNING should be sent (75% elapsed)
            else if (percentageElapsed >= 75) {
                const alreadySent = await hasRecentNotification(supabase, switchData.id, 'warning', 7);
                if (!alreadySent) {
                    console.log(`   📧 Sending warning to owner`);
                    await sendWarningNotification(supabase, switchData, daysSinceCheckIn);
                    results.warned++;
                }
            }
            else {
                console.log(`   ✅ Switch is healthy`);
            }

        } catch (err) {
            console.error(`Error processing switch ${switchData.id}:`, err);
        }
    }

    console.log('\n📈 Check complete:', results);
    return results;
}

/**
 * Trigger the Dead Man's Switch
 * - Generate access token
 * - Mark as triggered
 * - Send email to nominee
 */
async function triggerSwitch(supabase, switchData) {
    const accessToken = uuidv4();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // Token valid for 30 days

    // Update switch as triggered
    const { error: updateError } = await supabase
        .from('dead_mans_switch')
        .update({
            is_triggered: true,
            triggered_at: new Date().toISOString(),
            access_token: accessToken,
            token_expires_at: tokenExpiresAt.toISOString()
        })
        .eq('id', switchData.id);

    if (updateError) throw updateError;

    // Send email to nominee
    const accessLink = `${process.env.APP_URL}/vault/access/${accessToken}`;

    await sendTriggeredEmail({
        nomineeEmail: switchData.nominee_email,
        nomineeName: switchData.nominee_name,
        ownerEmail: switchData.vault_users?.email,
        personalMessage: switchData.personal_message,
        accessLink: accessLink,
        expiresAt: tokenExpiresAt
    });

    // Log the notification
    await logNotification(supabase, switchData.id, 'triggered', switchData.nominee_email);

    console.log(`   ✅ Switch triggered, email sent to ${switchData.nominee_email}`);
}

/**
 * Send warning notification to vault owner
 */
async function sendWarningNotification(supabase, switchData, daysSinceCheckIn) {
    const daysRemaining = switchData.inactivity_period_days - daysSinceCheckIn;

    await sendWarningEmail({
        ownerEmail: switchData.vault_users?.email,
        nomineeName: switchData.nominee_name,
        nomineeEmail: switchData.nominee_email,
        daysRemaining: daysRemaining,
        lastCheckIn: switchData.last_check_in,
        checkInLink: `${process.env.APP_URL}/checkin`
    });

    await logNotification(supabase, switchData.id, 'warning', switchData.vault_users?.email);
}

/**
 * Send final warning notification to vault owner
 */
async function sendFinalWarningNotification(supabase, switchData, daysSinceCheckIn) {
    const daysRemaining = switchData.inactivity_period_days - daysSinceCheckIn;

    await sendFinalWarningEmail({
        ownerEmail: switchData.vault_users?.email,
        nomineeName: switchData.nominee_name,
        nomineeEmail: switchData.nominee_email,
        daysRemaining: daysRemaining,
        lastCheckIn: switchData.last_check_in,
        checkInLink: `${process.env.APP_URL}/checkin`
    });

    await logNotification(supabase, switchData.id, 'final_warning', switchData.vault_users?.email);
}

/**
 * Check if a notification was already sent recently
 */
async function hasRecentNotification(supabase, switchId, emailType, daysBack) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const { data, error } = await supabase
        .from('notification_log')
        .select('id')
        .eq('switch_id', switchId)
        .eq('email_type', emailType)
        .gte('sent_at', cutoffDate.toISOString())
        .limit(1);

    if (error) {
        console.error('Error checking notifications:', error);
        return false;
    }

    return data && data.length > 0;
}

/**
 * Log notification to database
 */
async function logNotification(supabase, switchId, emailType, recipientEmail, status = 'sent') {
    await supabase
        .from('notification_log')
        .insert({
            switch_id: switchId,
            email_type: emailType,
            recipient_email: recipientEmail,
            status: status
        });
}

module.exports = {
    checkDeadMansSwitches,
    triggerSwitch
};
