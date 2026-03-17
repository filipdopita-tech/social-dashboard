import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import fs from 'fs'

export const SPREADSHEET_ID = '12LBNKEFQfOwdE2FAo4aAp-QCP6QZImARGjKgS5sBGjE'

export function getAuth(): JWT {
  let credentials: Record<string, string>

  if (process.env.GOOGLE_SA_BASE64) {
    const json = Buffer.from(process.env.GOOGLE_SA_BASE64, 'base64').toString('utf-8')
    credentials = JSON.parse(json)
  } else {
    const path = '/root/social_poster/service_account.json'
    credentials = JSON.parse(fs.readFileSync(path, 'utf-8'))
  }

  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}
