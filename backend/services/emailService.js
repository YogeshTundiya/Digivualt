/**
 * Email Service for Digital Legacy Vault
 * Handles all email notifications using Nodemailer
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const templates = {
    /**
     * Email sent when the switch is TRIGGERED
     * Sent to the NOMINEE with vault access link
     */
    triggered: ({ nomineeName, ownerEmail, personalMessage, accessLink, expiresAt }) => ({
        subject: '🔓 Digital Legacy Vault - You Have Been Granted Access',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Legacy Vault Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #12121a, #1a1a24); border-radius: 16px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(251, 113, 133, 0.1), transparent);">
                            <div style="width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(135deg, #FB7185, #F43F5E); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 28px;">🔓</span>
                            </div>
                            <h1 style="color: #F1F5F9; font-size: 28px; margin: 0; font-weight: 600;">Digital Legacy Vault</h1>
                            <p style="color: #94A3B8; font-size: 14px; margin: 10px 0 0;">Secure Access Notification</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #F1F5F9; font-size: 18px; margin: 0 0 20px;">Dear ${nomineeName || 'Trusted Person'},</p>
                            
                            <p style="color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                                You have been designated as a trusted nominee for a Digital Legacy Vault belonging to <strong style="color: #F1F5F9;">${ownerEmail}</strong>.
                            </p>
                            
                            <p style="color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                                Due to extended inactivity, the vault's Dead Man's Switch has been triggered, and you have been granted access to their important information.
                            </p>
                            
                            ${personalMessage ? `
                            <div style="background: rgba(251, 113, 133, 0.1); border-left: 4px solid #FB7185; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                                <p style="color: #FB7185; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px;">Personal Message</p>
                                <p style="color: #F1F5F9; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">"${personalMessage}"</p>
                            </div>
                            ` : ''}
                            
                            <!-- Access Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${accessLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FB7185, #F43F5E); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                                    Access the Vault
                                </a>
                            </div>
                            
                            <p style="color: #64748B; font-size: 13px; text-align: center; margin: 20px 0 0;">
                                This link will expire on ${new Date(expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.2); padding: 15px 20px; border-radius: 10px;">
                                <p style="color: #34D399; font-size: 13px; margin: 0;">
                                    <strong>🔒 Security Note:</strong> The vault contents are encrypted. You may need the master password to decrypt the information.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background: rgba(0,0,0,0.3); text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.1);">
                            <p style="color: #64748B; font-size: 12px; margin: 0;">
                                Digital Legacy Vault - Securing what matters most
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
Dear ${nomineeName || 'Trusted Person'},

You have been designated as a trusted nominee for a Digital Legacy Vault belonging to ${ownerEmail}.

Due to extended inactivity, the vault's Dead Man's Switch has been triggered, and you have been granted access to their important information.

${personalMessage ? `Personal Message: "${personalMessage}"` : ''}

Access the vault here: ${accessLink}

This link will expire on ${new Date(expiresAt).toLocaleDateString()}.

Security Note: The vault contents are encrypted. You may need the master password to decrypt the information.

Digital Legacy Vault - Securing what matters most
        `
    }),

    /**
     * Warning email sent to OWNER at 75% of inactivity period
     */
    warning: ({ ownerEmail, nomineeName, nomineeEmail, daysRemaining, checkInLink }) => ({
        subject: '⏰ Digital Legacy Vault - Check-in Reminder',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #12121a, #1a1a24); border-radius: 16px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent);">
                            <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
                            <h1 style="color: #FBBF24; font-size: 24px; margin: 0;">Check-in Reminder</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #F1F5F9; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Your Dead Man's Switch will trigger in <strong style="color: #FBBF24;">${daysRemaining} days</strong> if you don't check in.
                            </p>
                            <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                                When triggered, <strong>${nomineeName || nomineeEmail}</strong> will receive access to your Digital Legacy Vault.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${checkInLink}" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #34D399, #10B981); color: #0a0a0f; text-decoration: none; border-radius: 10px; font-weight: 600;">
                                    I'm Still Here - Check In Now
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background: rgba(0,0,0,0.3); text-align: center;">
                            <p style="color: #64748B; font-size: 12px; margin: 0;">Digital Legacy Vault</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `Check-in Reminder

Your Dead Man's Switch will trigger in ${daysRemaining} days if you don't check in.

When triggered, ${nomineeName || nomineeEmail} will receive access to your Digital Legacy Vault.

Check in now: ${checkInLink}
        `
    }),

    /**
     * FINAL warning email sent to OWNER at 90% of inactivity period
     */
    finalWarning: ({ ownerEmail, nomineeName, nomineeEmail, daysRemaining, checkInLink }) => ({
        subject: '🚨 URGENT: Digital Legacy Vault - Final Warning',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #12121a, #1a1a24); border-radius: 16px; overflow: hidden; border: 2px solid #FB7185;">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, rgba(251, 113, 133, 0.2), transparent);">
                            <div style="font-size: 48px; margin-bottom: 20px;">🚨</div>
                            <h1 style="color: #FB7185; font-size: 24px; margin: 0;">FINAL WARNING</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #FB7185; font-size: 18px; font-weight: 600; text-align: center; margin: 0 0 20px;">
                                Only ${daysRemaining} days remaining!
                            </p>
                            <p style="color: #F1F5F9; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                This is your <strong>final reminder</strong>. Your Dead Man's Switch will trigger soon and grant <strong>${nomineeName || nomineeEmail}</strong> access to your vault.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${checkInLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FB7185, #F43F5E); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                                    Check In Now - Reset Timer
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background: rgba(0,0,0,0.3); text-align: center;">
                            <p style="color: #64748B; font-size: 12px; margin: 0;">Digital Legacy Vault</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `🚨 FINAL WARNING

Only ${daysRemaining} days remaining!

This is your final reminder. Your Dead Man's Switch will trigger soon and grant ${nomineeName || nomineeEmail} access to your vault.

Check in now: ${checkInLink}
        `
    }),

    /**
     * Test email to verify nominee email address
     */
    test: ({ nomineeEmail, nomineeName, ownerEmail }) => ({
        subject: '✅ Digital Legacy Vault - Test Email Successful',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #12121a, #1a1a24); border-radius: 16px; overflow: hidden; border: 1px solid rgba(52, 211, 153, 0.3);">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), transparent);">
                            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                            <h1 style="color: #34D399; font-size: 24px; margin: 0;">Test Email Successful</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #F1F5F9; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hello ${nomineeName || 'there'},
                            </p>
                            <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                                This is a test email from Digital Legacy Vault. <strong style="color: #F1F5F9;">${ownerEmail}</strong> has designated you as their trusted nominee.
                            </p>
                            <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0;">
                                If their Dead Man's Switch is ever triggered, you will receive an email with secure access to their vault.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background: rgba(0,0,0,0.3); text-align: center;">
                            <p style="color: #64748B; font-size: 12px; margin: 0;">This is only a test. No action is required.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `Test Email Successful

Hello ${nomineeName || 'there'},

This is a test email from Digital Legacy Vault. ${ownerEmail} has designated you as their trusted nominee.

If their Dead Man's Switch is ever triggered, you will receive an email with secure access to their vault.

This is only a test. No action is required.
        `
    })
};

/**
 * Send email using configured transporter
 */
async function sendEmail(to, template) {
    const mailOptions = {
        from: `"Digital Legacy Vault" <${process.env.SMTP_USER}>`,
        to: to,
        subject: template.subject,
        html: template.html,
        text: template.text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email failed to ${to}:`, error.message);
        throw error;
    }
}

// Export email functions
module.exports = {
    sendTriggeredEmail: async (data) => {
        const template = templates.triggered(data);
        return sendEmail(data.nomineeEmail, template);
    },

    sendWarningEmail: async (data) => {
        const template = templates.warning(data);
        return sendEmail(data.ownerEmail, template);
    },

    sendFinalWarningEmail: async (data) => {
        const template = templates.finalWarning(data);
        return sendEmail(data.ownerEmail, template);
    },

    sendTestEmail: async (switchData) => {
        const template = templates.test({
            nomineeEmail: switchData.nominee_email,
            nomineeName: switchData.nominee_name,
            ownerEmail: switchData.vault_users?.email || 'Vault Owner'
        });
        return sendEmail(switchData.nominee_email, template);
    }
};
