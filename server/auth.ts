import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type express from 'express'
import { deleteMinecraftLink, getMinecraftLink, saveMinecraftLink, type MinecraftProfile } from './accountLinks.js'

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10'
const DISCORD_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize'
const DISCORD_TOKEN_URL = `${DISCORD_API_BASE_URL}/oauth2/token`
const DISCORD_ME_URL = `${DISCORD_API_BASE_URL}/users/@me`
const MOJANG_PROFILE_URL = 'https://api.mojang.com/users/profiles/minecraft'
const SESSION_COOKIE = 'nsc_session'
const OAUTH_STATE_COOKIE = 'nsc_oauth_state'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10

type DiscordTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

type DiscordUserResponse = {
  id: string
  username: string
  global_name: string | null
  discriminator: string
  avatar: string | null
  email?: string | null
  verified?: boolean
}

type MojangProfileResponse = {
  id: string
  name: string
}

export type AuthSession = {
  discordId: string
  username: string
  displayName: string
  avatarUrl: string | null
  email: string | null
  minecraft: MinecraftProfile | null
  role: 'participant'
  issuedAt: number
  expiresAt: number
}

type AuthConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  webOrigin: string
  sessionSecret: string
  secureCookies: boolean
}

export function registerDiscordAuthRoutes(app: express.Express) {
  app.get('/api/auth/discord/start', (request, response) => {
    const config = getAuthConfig(response)
    if (!config) {
      return
    }

    const state = createSignedState(config.sessionSecret)
    response.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions(config.secureCookies, OAUTH_STATE_MAX_AGE_SECONDS))

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: 'identify email',
      state,
      prompt: 'consent',
    })
    response.redirect(`${DISCORD_AUTHORIZE_URL}?${params.toString()}`)
  })

  app.get('/api/auth/discord/callback', async (request, response) => {
    const config = getAuthConfig(response)
    if (!config) {
      return
    }

    const code = typeof request.query.code === 'string' ? request.query.code : ''
    const state = typeof request.query.state === 'string' ? request.query.state : ''
    const expectedState = getCookie(request, OAUTH_STATE_COOKIE)
    if (!code || !state || !validOAuthState(state, expectedState, config.sessionSecret)) {
      response.status(400).json({ error: 'invalid_oauth_state' })
      return
    }

    try {
      const token = await exchangeDiscordCode(code, config)
      const discordUser = await fetchDiscordUser(token.access_token)
      const session = createSession(discordUser)
      response.clearCookie(OAUTH_STATE_COOKIE, clearOauthCookieOptions(config.secureCookies))
      response.cookie(SESSION_COOKIE, signSession(session, config.sessionSecret), sessionCookieOptions(config.secureCookies, SESSION_MAX_AGE_SECONDS))
      response.redirect(`${config.webOrigin}/my-page`)
    } catch (error) {
      console.error('Discord OAuth callback failed', error)
      response.status(502).json({ error: 'discord_oauth_failed' })
    }
  })

  app.get('/api/auth/me', (request, response) => {
    const config = getAuthConfig(response)
    if (!config) {
      return
    }

    const sessionCookie = getCookie(request, SESSION_COOKIE)
    const session = sessionCookie ? verifySession(sessionCookie, config.sessionSecret) : null
    if (!session) {
      response.status(401).json({ error: 'unauthenticated' })
      return
    }

    const hydratedSession = hydrateSession(session)
    if (hydratedSession !== session) {
      response.cookie(SESSION_COOKIE, signSession(hydratedSession, config.sessionSecret), sessionCookieOptions(config.secureCookies, SESSION_MAX_AGE_SECONDS))
    }

    response.json({ user: hydratedSession })
  })

  app.post('/api/auth/minecraft/link', async (request, response) => {
    const config = getAuthConfig(response)
    if (!config) {
      return
    }

    const session = getSessionFromRequest(request, config.sessionSecret)
    if (!session) {
      response.status(401).json({ error: 'unauthenticated' })
      return
    }

    try {
      const minecraft = await resolveMinecraftProfile(request.body as { minecraftName?: string; edition?: MinecraftProfile['edition'] })
      saveMinecraftLink(session.discordId, minecraft)
      const updatedSession: AuthSession = { ...session, minecraft }
      response.cookie(SESSION_COOKIE, signSession(updatedSession, config.sessionSecret), sessionCookieOptions(config.secureCookies, SESSION_MAX_AGE_SECONDS))
      response.json({ user: updatedSession })
    } catch (error) {
      response.status(400).json({ error: error instanceof Error ? error.message : 'minecraft_link_failed' })
    }
  })

  app.post('/api/auth/minecraft/unlink', (request, response) => {
    const config = getAuthConfig(response)
    if (!config) {
      return
    }

    const session = getSessionFromRequest(request, config.sessionSecret)
    if (!session) {
      response.status(401).json({ error: 'unauthenticated' })
      return
    }

    deleteMinecraftLink(session.discordId)
    const updatedSession: AuthSession = { ...session, minecraft: null }
    response.cookie(SESSION_COOKIE, signSession(updatedSession, config.sessionSecret), sessionCookieOptions(config.secureCookies, SESSION_MAX_AGE_SECONDS))
    response.json({ user: updatedSession })
  })

  app.post('/api/auth/logout', (_request, response) => {
    const secureCookies = process.env.NODE_ENV === 'production'
    response.clearCookie(SESSION_COOKIE, clearSessionCookieOptions(secureCookies))
    response.json({ ok: true })
  })
}

function getAuthConfig(response: express.Response): AuthConfig | null {
  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173'
  const sessionSecret = process.env.SESSION_SECRET ?? process.env.JWT_SECRET

  if (!clientId || !clientSecret || !redirectUri || !sessionSecret) {
    response.status(500).json({ error: 'discord_oauth_not_configured' })
    return null
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    webOrigin,
    sessionSecret,
    secureCookies: process.env.NODE_ENV === 'production',
  }
}

async function exchangeDiscordCode(code: string, config: AuthConfig): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
  })

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`Discord token exchange failed: ${response.status}`)
  }

  return (await response.json()) as DiscordTokenResponse
}

async function fetchDiscordUser(accessToken: string): Promise<DiscordUserResponse> {
  const response = await fetch(DISCORD_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Discord user fetch failed: ${response.status}`)
  }

  return (await response.json()) as DiscordUserResponse
}

function createSession(user: DiscordUserResponse): AuthSession {
  const now = Math.floor(Date.now() / 1000)
  return {
    discordId: user.id,
    username: user.username,
    displayName: user.global_name ?? user.username,
    avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null,
    email: user.email ?? null,
    minecraft: getMinecraftLink(user.id),
    role: 'participant',
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  }
}

function signSession(session: AuthSession, secret: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function hydrateSession(session: AuthSession): AuthSession {
  const savedMinecraft = getMinecraftLink(session.discordId)
  if (savedMinecraft === session.minecraft) {
    return session
  }

  return { ...session, minecraft: savedMinecraft }
}

async function resolveMinecraftProfile(input: { minecraftName?: string; edition?: MinecraftProfile['edition'] }): Promise<MinecraftProfile> {
  const edition = input.edition ?? 'java'
  const rawName = input.minecraftName?.trim()

  if (!rawName || !/^[A-Za-z0-9_]{3,16}$/.test(rawName)) {
    throw new Error('invalid_minecraft_name')
  }

  if (edition !== 'java') {
    const accountId = toBedrockAccountId(rawName)
    return {
      accountId,
      name: accountId,
      uuid: null,
      edition,
      source: 'prefixed_id',
      linkedAt: new Date().toISOString(),
    }
  }

  const response = await fetch(`${MOJANG_PROFILE_URL}/${encodeURIComponent(rawName)}`)
  if (response.status === 204 || response.status === 404) {
    throw new Error('minecraft_profile_not_found')
  }
  if (!response.ok) {
    throw new Error('mojang_api_unavailable')
  }

  const profile = (await response.json()) as MojangProfileResponse
  const uuid = normalizeUuid(profile.id) ?? profile.id
  return {
    accountId: profile.name,
    name: profile.name,
    uuid,
    edition: 'java',
    source: 'mojang',
    linkedAt: new Date().toISOString(),
  }
}

function toBedrockAccountId(value: string) {
  const withoutPrefix = value.replace(/^BE_/i, '')
  return `BE_${withoutPrefix}`
}

function normalizeUuid(value: string) {
  const compact = value.replaceAll('-', '').toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(compact)) {
    return null
  }

  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`
}

function getSessionFromRequest(request: express.Request, secret: string) {
  const sessionCookie = getCookie(request, SESSION_COOKIE)
  return sessionCookie ? verifySession(sessionCookie, secret) : null
}

function verifySession(value: string, secret: string): AuthSession | null {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) {
    return null
  }

  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  if (!safeEqual(signature, expected)) {
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthSession
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null
    }

    return session
  } catch {
    return null
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function createSignedState(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      nonce: randomToken(),
      expiresAt: Math.floor(Date.now() / 1000) + OAUTH_STATE_MAX_AGE_SECONDS,
    }),
  ).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function validOAuthState(state: string, expectedState: string | null, secret: string) {
  if (expectedState && state === expectedState) {
    return true
  }

  const [payload, signature] = state.split('.')
  if (!payload || !signature) {
    return false
  }

  const expectedSignature = createHmac('sha256', secret).update(payload).digest('base64url')
  if (!safeEqual(signature, expectedSignature)) {
    return false
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { expiresAt?: number }
    return typeof parsed.expiresAt === 'number' && parsed.expiresAt > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

function getCookie(request: express.Request, name: string) {
  const cookies = request.header('cookie')?.split(';') ?? []
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(value.join('='))
    }
  }
  return null
}

function sessionCookieOptions(secure: boolean, maxAgeSeconds: number): express.CookieOptions {
  return {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    maxAge: maxAgeSeconds * 1000,
    path: '/',
  }
}

function oauthCookieOptions(secure: boolean, maxAgeSeconds: number): express.CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: maxAgeSeconds * 1000,
    path: '/',
  }
}

function clearSessionCookieOptions(secure: boolean): express.CookieOptions {
  return {
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  }
}

function clearOauthCookieOptions(secure: boolean): express.CookieOptions {
  return {
    sameSite: 'lax',
    secure,
    path: '/',
  }
}

function randomToken() {
  return randomBytes(32).toString('base64url')
}
