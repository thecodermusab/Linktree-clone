import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROFILE_OVERRIDE_PATH = path.join(process.cwd(), 'data', 'profile-overrides.json')

export async function readProfileOverrides<T extends Record<string, unknown>>() {
  try {
    const raw = await readFile(PROFILE_OVERRIDE_PATH, 'utf8')
    return JSON.parse(raw) as Partial<T>
  } catch {
    return {} as Partial<T>
  }
}

export async function writeProfileOverrides<T extends Record<string, unknown>>(patch: Partial<T>) {
  const current = await readProfileOverrides<T>()
  const next = { ...current, ...patch }
  await mkdir(path.dirname(PROFILE_OVERRIDE_PATH), { recursive: true })
  await writeFile(PROFILE_OVERRIDE_PATH, JSON.stringify(next, null, 2))
}
