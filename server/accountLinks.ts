import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export type MinecraftProfile = {
  accountId: string
  name: string
  uuid: string | null
  edition: 'java' | 'bedrock' | 'floodgate'
  source: 'mojang' | 'prefixed_id'
  linkedAt: string
}

type AccountLinkStore = Record<string, MinecraftProfile>

export function getMinecraftLink(discordId: string) {
  return readStore()[discordId] ?? null
}

export function saveMinecraftLink(discordId: string, minecraft: MinecraftProfile) {
  const store = readStore()
  store[discordId] = minecraft
  writeStore(store)
}

export function deleteMinecraftLink(discordId: string) {
  const store = readStore()
  delete store[discordId]
  writeStore(store)
}

function readStore(): AccountLinkStore {
  const storePath = getStorePath()
  if (!existsSync(storePath)) {
    return {}
  }

  try {
    const parsed = JSON.parse(readFileSync(storePath, 'utf8')) as AccountLinkStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: AccountLinkStore) {
  const storePath = getStorePath()
  mkdirSync(dirname(storePath), { recursive: true })
  const tempPath = `${storePath}.tmp`
  writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`)
  renameSync(tempPath, storePath)
}

function getStorePath() {
  return resolve(process.cwd(), process.env.AUTH_LINK_STORE_PATH ?? 'data/auth-links.json')
}
