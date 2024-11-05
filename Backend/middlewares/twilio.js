import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

const smsClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export { smsClient, TWILIO_PHONE_NUMBER };
