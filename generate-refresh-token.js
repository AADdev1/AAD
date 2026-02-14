import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
}

const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ["https://mail.google.com/"];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\n🔗 Open this URL in your browser:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the authorization code here: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\n✅ COPY THIS REFRESH TOKEN:\n");
    console.log(tokens.refresh_token);
  } catch (err) {
    console.error("❌ Error generating refresh token:", err);
  }
  rl.close();
});
