import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error) return NextResponse.json({ error }, { status: 400 })
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LI_REDIRECT_URI || '',
      client_id: process.env.LI_CLIENT_ID || '',
      client_secret: process.env.LI_CLIENT_SECRET || '',
    }),
  })

  const token = await tokenRes.json()
  if (!token.access_token) {
    return NextResponse.json({ error: 'Token exchange failed', detail: token }, { status: 400 })
  }

  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: 'Bearer ' + token.access_token },
  })
  const profile = await profileRes.json()

  return NextResponse.json({
    success: true,
    access_token: token.access_token,
    expires_in: token.expires_in,
    profile,
    message: 'Zkopiruj access_token a posli ho do Claude Code'
  })
}
