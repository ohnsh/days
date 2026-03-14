import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import type { DayEntry } from './lib/days'

function getPagination(page): StarlightRouteData['pagination'] {
  const next = page.url.next ? { href: page.url.next } : undefined
  const prev = page.url.prev ? { href: page.url.prev } : undefined
  return { next, prev }
}

export const onRequest = defineRouteMiddleware(async (context) => {
  const { head, pagination } = context.locals.starlightRoute
  const { day, page } = context.locals.days ?? {}
  
  if (page) {
    const ogImage = ogImageFromPage(page)
    if (ogImage) {
      setOgImage(head, ogImage)
    }
    Object.assign(pagination, getPagination(page))
  } else if (day) {
    const ogImage = extractOgImage(day)
    if (ogImage) {
      setOgImage(head, ogImage)
    }
  }
})

function extractOgImage(entry: DayEntry) {
  const { day, youtube } = entry
  if (day?.data.ogImage) {
    return day.data.ogImage
  }
  
  const videoId = youtube?.data[0].videoId
  // const { videoId } = body?.match(/<YouTube\s+id="(?<videoId>[^"]+)"/)?.groups ?? {}
  
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  }
}

function ogImageFromPage(page) {
  for (const day of page.data) {
    const ogImage = extractOgImage(day)
    if (ogImage) {
      return ogImage
    }
  }
}

function setOgImage(head: StarlightRouteData['head'], ogImage: string) {
  head.push({ tag: 'meta', attrs: { property: 'og:image', content: ogImage } })
}