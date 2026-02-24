import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  dataverse: {
    url: process.env.DATAVERSE_URL,
    clientId: process.env.DATAVERSE_CLIENT_ID,
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET,
    tenantId: process.env.DATAVERSE_TENANT_ID,
    scope: process.env.DATAVERSE_SCOPE || `${process.env.DATAVERSE_URL}/.default`,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

export function validateConfig() {
  const required = [
    'DATAVERSE_URL',
    'DATAVERSE_CLIENT_ID',
    'DATAVERSE_CLIENT_SECRET',
    'DATAVERSE_TENANT_ID',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  if (!config.dataverse.url.startsWith('https://')) {
    throw new Error('DATAVERSE_URL must start with https://');
  }
}
