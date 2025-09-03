"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
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
}
exports.default = new EmailService();
