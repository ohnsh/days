import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'

async function savePlaylists(forHandle: string) {
  const uploadsPlaylistId = await getUploadsPlaylistId(forHandle)
  const shortsPlaylistId = uploadsPlaylistId.replace(/^UU/, 'UUSH')

  const uploads = await getPlaylistItems(uploadsPlaylistId)
  const shorts = await getPlaylistItems(shortsPlaylistId)

  await mkdir('.days/youtube', { recursive: true })
  await Bun.file('.days/youtube/uploads.json').write(JSON.stringify(uploads))
  await Bun.file('.days/youtube/shorts.json').write(JSON.stringify(shorts))
}

async function getPlaylistItems(playlistId: string) {
  // https://developers.google.com/youtube/v3/docs/playlistItems#resource
  const allItems = []
  let pageToken = undefined
  do {
    const { nextPageToken, items } = await getPlaylist(playlistId, pageToken)
    allItems.push(...items)
    pageToken = nextPageToken
  } while (pageToken)

  return allItems
}

async function api(path: string, params: Record<string, string>) {
  const key = import.meta.env.YT_API_KEY!
  const baseUrl = 'https://youtube.googleapis.com/youtube/v3'
  const urlParams = new URLSearchParams({ ...params, key })
  const headers = {
    Accept: 'application/json',
  }

  const resp = await fetch(`${baseUrl}${path}?${urlParams}`, { headers })
  const json = await resp.json()
  if (!resp.ok) {
    throw new Error(json.message)
  }
  return json
}

async function getUploadsPlaylistId(forHandle: string): Promise<string> {
  const params = { part: 'snippet,contentDetails,statistics', forHandle }
  const json = await api('/channels', params)
  const [channel] = json.items
  return channel.contentDetails.relatedPlaylists.uploads
}

async function getPlaylist(playlistId: string, pageToken?: string) {
  // pageToken
  const params = {
    part: 'snippet',
    playlistId,
    maxResults: '50',
    ...(pageToken ? { pageToken } : {}),
  }
  const json = await api('/playlistItems', params)
  return json
}

await savePlaylists('ohn-sh')
