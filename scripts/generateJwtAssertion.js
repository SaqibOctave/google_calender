// Dev utility: builds and signs the JWT "assertion" Google's token endpoint expects.
// Paste the output into a Postman request that POSTs to https://oauth2.googleapis.com/token
// to fetch an access token as a real, visible HTTP call instead of pasting a token directly.
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const KEY_FILE = path.join(__dirname, '..', 'schedular-501007-b83a2d8499a6.json');
const SCOPE = 'https://www.googleapis.com/auth/calendar';

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function main() {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: key.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(Buffer.from(JSON.stringify(header)))}.${base64url(Buffer.from(JSON.stringify(claims)))}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key);
  const assertion = `${unsigned}.${base64url(signature)}`;

  console.log(assertion);
}

main();
