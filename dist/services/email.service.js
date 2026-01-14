"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: config_1.MAIL_SERVICE,
            auth: {
                user: config_1.MAIL_USER,
                pass: config_1.MAIL_PASS,
            },
        });
    }
    /**
     * Create a dynamic transporter with custom SMTP configuration
     */
    createDynamicTransporter(config) {
        if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
            throw new Error('SMTP configuration is incomplete. Please configure SMTP host, username, and password.');
        }
        return nodemailer_1.default.createTransport({
            host: config.smtp_host,
            port: config.smtp_port || 587,
            secure: config.smtp_secure, // true for 465, false for other ports
            auth: {
                user: config.smtp_user,
                pass: config.smtp_password
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });
    }
    async sendEmail(to, subject, text, html) {
        const mailOptions = {
            from: `ICT Asset Mgmt <${config_1.MAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };
        return this.transporter.sendMail(mailOptions);
    }
    /**
     * Send email using dynamic SMTP configuration from system settings
     */
    async sendEmailWithConfig(to, subject, text, html, config) {
        const transporter = this.createDynamicTransporter(config);
        const fromName = config.smtp_from_name || config.app_name || 'Asset Management System';
        const fromEmail = config.smtp_from_email || config.smtp_user;
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            text,
            html
        };
        try {
            await transporter.sendMail(mailOptions);
            logger_1.default.info(`Email sent successfully to ${to}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to send email to ${to}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    /**
     * Send a test email to verify SMTP configuration
     */
    async sendTestEmail(to, config) {
        const appName = config.app_name || 'Asset Management System';
        await this.sendEmailWithConfig(to, `Test Email from ${appName}`, `Email Configuration Test\n\nThis is a test email from ${appName}.\nIf you received this email, your SMTP configuration is working correctly!`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1abc9c;">Email Configuration Test</h2>
          <p>This is a test email from <strong>${appName}</strong>.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent automatically to test the email configuration.
          </p>
        </div>
      `, config);
    }
    /**
     * Send password notification email to a user
     */
    async sendPasswordEmail(to, firstName, email, password, config) {
        const appName = config.app_name || 'Asset Management System';
        await this.sendEmailWithConfig(to, `Your ${appName} Account Credentials`, `Welcome to ${appName}\n\nDear ${firstName},\n\nYour account has been created.\n\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease login and change your password immediately for security purposes.`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1abc9c;">Welcome to ${appName}</h2>
          <p>Dear ${firstName},</p>
          <p>Your account has been created. Below are your login credentials:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          <p style="color: #dc3545;"><strong>Important:</strong> Please login and change your password immediately for security purposes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `, config);
    }
}
exports.default = new EmailService();
