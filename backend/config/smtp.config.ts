import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

export const smtpConfig: SMTPConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
};

export const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'AKIBEKS Engineering Solutions',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@akibeks.co.ke'
  },
  templates: {
    welcome: 'welcome',
    contact: 'contact-notification',
    quotation: 'quotation-request',
    invoice: 'invoice-notification'
  }
};

// Validation
export const validateSMTPConfig = (): boolean => {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required SMTP environment variables:', missing.join(', '));
    return false;
  }
  
  return true;
};

export default {
  smtp: smtpConfig,
  email: emailConfig,
  validate: validateSMTPConfig
};