import { google } from "googleapis"

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GMAIL_SENDER,
} = process.env

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GMAIL_SENDER) {
  throw new Error("Missing Gmail OAuth env vars")
}

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
)

oAuth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
})

const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client,
})

export async function sendHtmlEmail(
  to: string,
  subject: string,
  htmlBody: string
) {
  // ✅ FIX: ensure fresh access token
  const accessToken = await oAuth2Client.getAccessToken()

  oAuth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
    access_token: accessToken.token!,
  })

  const message = [
    `From: ${GMAIL_SENDER}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    htmlBody,
  ].join("\n")

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  })
}
