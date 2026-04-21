import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { Day } from './lib/days'
import type { Page } from 'astro'
import type { CollectionEntry } from 'astro:content'

function getPagination(page: Page): StarlightRouteData['pagination'] {
  const next = page.url.next ? { href: page.url.next } : undefined
  const prev = page.url.prev ? { href: page.url.prev } : undefined
  return { next, prev }
}

export const onRequest = defineRouteMiddleware(async (context) => {
  const { head, pagination } = context.locals.starlightRoute
  const { day, page } = context.locals.days ?? {}
  const screenshotUrl = 'https://days.ohn.sh/screenshot-3-17.png'

  if (page) {
    const ogImages = ogImagesFromPage(page)
    appendOgImages(head, ...ogImages)
    Object.assign(pagination, getPagination(page))
  } else if (day) {
    const ogImages = extractOgImages(day)
    appendOgImages(head, ...ogImages)
  }

  appendOgImages(head, screenshotUrl)
})

function extractOgImages(entry: Day) {
  const { meta, youtube } = entry
  if (meta?.data.ogImage) {
    return [meta.data.ogImage]
  }

  const priority = ['🐶', '🎣', '🎙️', '🏃‍♂️', '🤳', '🚗']

  const tagScore = (tag: string) =>
    priority.includes(tag) ? priority.indexOf(tag) : priority.length

  const entryScore = ({ data: { tags }}: CollectionEntry<'youtube'>) => tags ? Math.min(...tags.map(tagScore)) : priority.length

  const videoIds =
    youtube
      .sort((a, b) => entryScore(a) - entryScore(b))
      .map(({ data }) => data.videoId) ?? []
  // const videoId = youtube?.data[0].videoId
  // const { videoId } = body?.match(/<YouTube\s+id="(?<videoId>[^"]+)"/)?.groups ?? {}

  return videoIds.map((videoId) => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
}

function ogImagesFromPage(page: Page) {
  for (const day of page.data) {
    const ogImages = extractOgImages(day)
    if (ogImages.length > 0) {
      return ogImages
    }
  }
  return []
}

function appendOgImages(head: StarlightRouteData['head'], ...ogImages: string[]) {
  ogImages.forEach((ogImage) => {
    head.push({ tag: 'meta', attrs: { property: 'og:image', content: ogImage } })
  })
}
