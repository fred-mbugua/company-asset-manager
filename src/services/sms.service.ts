import logger from '../utils/logger';
import { SMS_API_KEY } from '../config';

class SMSService {
  private apiKey: string;
  constructor() {
    this.apiKey = SMS_API_KEY ?? '';
  }

  async sendSMS(to: string, message: string) {
    if (!this.apiKey) {
      logger.warn('SMS API key is not configured. Skipping SMS.');
      return;
    }

    try {
      // Placeholder for actual SMS API call, e.g., using Twilio or another provider's SDK
      // const response = await twilio.messages.create({
      //   to,
      //   from: 'your-twilio-number',
      //   body: message,
      // });
      logger.info(`SMS sent to ${to}: ${message}`);
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      throw new Error('Failed to send SMS');
    }
  }
}

export default new SMSService();