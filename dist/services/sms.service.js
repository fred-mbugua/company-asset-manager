"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = require("../config");
class SMSService {
    constructor() {
        this.apiKey = config_1.SMS_API_KEY !== null && config_1.SMS_API_KEY !== void 0 ? config_1.SMS_API_KEY : '';
    }
    async sendSMS(to, message) {
        if (!this.apiKey) {
            logger_1.default.warn('SMS API key is not configured. Skipping SMS.');
            return;
        }
        try {
            // Placeholder for actual SMS API call, e.g., using Twilio or another provider's SDK
            // const response = await twilio.messages.create({
            //   to,
            //   from: 'your-twilio-number',
            //   body: message,
            // });
            logger_1.default.info(`SMS sent to ${to}: ${message}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to send SMS to ${to}:`, error);
            throw new Error('Failed to send SMS');
        }
    }
}
exports.default = new SMSService();
