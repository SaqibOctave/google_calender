// Dev utility: prints a short-lived OAuth2 access token for the service account,
// for pasting into Postman's Authorization header when calling Google APIs directly.
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'schedular-501007-b83a2d8499a6.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: SCOPES });
  const client = await auth.getClient();
  const { token, res } = await client.getAccessToken();

  console.log('Access token:\n');
  console.log(token);
  console.log('\nExpires (approx):', res?.data?.expires_in ? `${res.data.expires_in}s from now` : '~1 hour');
}

main().catch((err) => {
  console.error('Failed to get access token:', err.message);
  process.exit(1);
});
