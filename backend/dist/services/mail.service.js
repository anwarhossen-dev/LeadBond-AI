"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
let transporter = null;
// Initialize Transporter
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer_1.default.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
    console.log('✅ Mail Service: Real SMTP transporter configured successfully.');
}
else {
    console.log('⚠️ Mail Service: No SMTP credentials found in environment variables. Falling back to Console/Mock Mailer.');
}
/**
 * Sends a raw/html email. Falls back to logging to console if no SMTP credentials are provided.
 */
const sendEmail = async (to, subject, html) => {
    const from = SMTP_USER || 'no-reply@leadbond.ai';
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"LeadBond AI" <${from}>`,
                to,
                subject,
                html,
            });
            console.log(`✉️ Real Email Sent to ${to}: Message ID = ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            console.error(`❌ Failed to send real email to ${to}:`, error);
            throw error;
        }
    }
    else {
        // Mock Sender - Logs clearly to console
        console.log('\n=================== MOCK EMAIL LOG ===================');
        console.log(`FROM: "LeadBond AI" <${from}>`);
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`CONTENT:\n${html.replace(/<[^>]*>/g, '')}`); // strip HTML for clean console log
        console.log('======================================================\n');
        return { success: true, messageId: 'mock-id-' + Math.random().toString(36).substring(2, 11) };
    }
};
exports.sendEmail = sendEmail;
/**
 * Sends system/alert notification to administrators/agents.
 */
const sendNotification = async (to, subject, text) => {
    const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">LeadBond AI Notification</h2>
      <p style="font-size: 16px; line-height: 1.6;">${text}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">This is an automated system notification from your LeadBond AI CRM dashboard.</p>
    </div>
  `;
    return (0, exports.sendEmail)(to, subject, htmlContent);
};
exports.sendNotification = sendNotification;
