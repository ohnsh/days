import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'

async function savePlaylists(forHandle: string) {
  const uploadsPlaylistId = await getUploadsPlaylistId(forHandle)
  const shortsPlaylistId = uploadsPlaylistId.replace(/^UU/, 'UUSH')

  const uploadsSaved = await Bun.file('.days/youtube/uploads.json')
    .json()
    .catch((_) => [])
  const shortsSaved = await Bun.file('.days/youtube/shorts.json')
    .json()
    .catch((_) => [])
  const uploads = await getPlaylist(uploadsPlaylistId, uploadsSaved)
  const shorts = await getPlaylist(shortsPlaylistId, shortsSaved)

  await mkdir('.days/youtube', { recursive: true })
  await Bun.file('.days/youtube/uploads.json').write(JSON.stringify(uploads))
  await Bun.file('.days/youtube/shorts.json').write(JSON.stringify(shorts))
}

async function api(path: string, params: Record<string, string>) {
  const key = import.meta.env.YT_API_KEY!
  const baseUrl = 'https://youtube.googleapis.com/youtube/v3'
  const urlParams = new URLSearchParams({ ...params, key })
  const headers = { Accept: 'application/json' }

  const resp = await fetch(`${baseUrl}${path}?${urlParams}`, { headers })
  const json = await resp.json()
  if (!resp.ok) {
    throw new Error(json.message)
  }
  return json
}

async function apiAllPages(path: string, params: Record<string, string>) {
  const allItems = []
  let pageToken = undefined
  do {
    const _params = { ...params, ...(pageToken ? { pageToken } : {}) }
    const { nextPageToken, items } = await api(path, _params)
    allItems.push(...items)
    pageToken = nextPageToken
  } while (pageToken)

  return allItems
}

async function* apiPage(path: string, params: Record<string, string>) {
  let pageToken = undefined
  do {
    const _params = { ...params, ...(pageToken ? { pageToken } : {}) }
    const { nextPageToken, items } = await api(path, _params)
    yield items
    pageToken = nextPageToken
  } while (pageToken)
}

async function getUploadsPlaylistId(forHandle: string): Promise<string> {
  const params = { part: 'snippet,contentDetails,statistics', forHandle }
  const json = await api('/channels', params)
  const [channel] = json.items
  return channel.contentDetails.relatedPlaylists.uploads
}

async function getPlaylistAll(playlistId: string) {
  const params = { part: 'snippet', playlistId, maxResults: '50' }
  return await apiAllPages('/playlistItems', params)
}

async function getPlaylist(playlistId: string, savedItems: any[]) {
  if (savedItems.length === 0) {
    console.log(`YouTube loader: no saved items; fetching entire playlist ${playlistId}`)
    return getPlaylistAll(playlistId)
  }

  const params = { part: 'snippet', playlistId, maxResults: '10' }

  const [lastSaved] = savedItems
  const allFetched = []
  for await (const items of apiPage('/playlistItems', params)) {
    // const { id } = items.at(-1)
    // const { videoId } = items.at(-1).snippet.resourceId
    const newUntil = items.findIndex((item) => item.id === lastSaved.id)
    console.log(`YouTube loader: fetched new incremental page; newUntil=${newUntil}`)
    if (newUntil === -1) {
      allFetched.push(...items)
    } else {
      allFetched.push(...items.slice(0, newUntil))
      break
    }
  }

  return [...allFetched, ...savedItems]
}

await savePlaylists('ohn-sh')
