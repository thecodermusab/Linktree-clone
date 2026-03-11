import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const COLLECTIONS_PATH = path.join(process.cwd(), 'data', 'collections.json')

export type CollectionLayout = 'stack' | 'grid' | 'carousel' | 'showcase'

export type Collection = {
  id: string
  title: string
  layout: CollectionLayout
  is_visible: boolean
  sort_order: number
}

type CollectionsData = {
  collections: Collection[]
  linkAssignments: Record<string, string>
}

async function readData(): Promise<CollectionsData> {
  try {
    const raw = await readFile(COLLECTIONS_PATH, 'utf8')
    return JSON.parse(raw) as CollectionsData
  } catch {
    return { collections: [], linkAssignments: {} }
  }
}

async function writeData(data: CollectionsData): Promise<void> {
  await mkdir(path.dirname(COLLECTIONS_PATH), { recursive: true })
  await writeFile(COLLECTIONS_PATH, JSON.stringify(data, null, 2))
}

export async function readCollectionsData(): Promise<CollectionsData> {
  return readData()
}

export async function createCollection(input: { title: string; layout?: CollectionLayout }): Promise<Collection> {
  const data = await readData()
  const collection: Collection = {
    id: randomUUID(),
    title: input.title || 'Collection',
    layout: input.layout || 'stack',
    is_visible: true,
    sort_order: data.collections.length,
  }
  data.collections.push(collection)
  await writeData(data)
  return collection
}

export async function updateCollection(id: string, patch: Partial<Omit<Collection, 'id'>>): Promise<Collection | null> {
  const data = await readData()
  const idx = data.collections.findIndex(c => c.id === id)
  if (idx === -1) return null
  data.collections[idx] = { ...data.collections[idx], ...patch }
  await writeData(data)
  return data.collections[idx]
}

export async function deleteCollection(id: string): Promise<void> {
  const data = await readData()
  data.collections = data.collections.filter(c => c.id !== id)
  for (const linkId of Object.keys(data.linkAssignments)) {
    if (data.linkAssignments[linkId] === id) delete data.linkAssignments[linkId]
  }
  await writeData(data)
}

export async function setLinkAssignment(linkId: string, collectionId: string | null): Promise<void> {
  const data = await readData()
  if (collectionId) {
    data.linkAssignments[linkId] = collectionId
  } else {
    delete data.linkAssignments[linkId]
  }
  await writeData(data)
}
