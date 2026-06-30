require('dotenv').config();

const required = [
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_CALENDAR_ID',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  google: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    // .env stores literal "\n" sequences; convert them back to real newlines.
    privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    calendarId: process.env.GOOGLE_CALENDAR_ID,
  },

  scheduling: {
    timezone: process.env.TIMEZONE || 'UTC',
    businessStartHour: Number(process.env.BUSINESS_START_HOUR ?? 9),
    businessEndHour: Number(process.env.BUSINESS_END_HOUR ?? 18),
    slotDurationMinutes: Number(process.env.SLOT_DURATION_MINUTES ?? 30),
  },
};
