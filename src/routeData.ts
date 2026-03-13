import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data'
import { extractOgImage, setOgImage } from '@/lib/util'

function ogImageFromPage(page) {
  for (const post of page.data) {
    const ogImage = extractOgImage(post)
    if (ogImage) {
      return ogImage
    }
  }
}

function getPagination(page): StarlightRouteData['pagination'] {
  const next = page.url.next ? { href: page.url.next } : undefined
  const prev = page.url.prev ? { href: page.url.prev } : undefined
  return { next, prev }
}

export const onRequest = defineRouteMiddleware(async (context) => {
  const { head, pagination } = context.locals.starlightRoute
  const { page } = context.locals.days ?? {}

  // const ogImage = page ? ogImageFromPage(page) : extractOgImage(entry)
  // if (ogImage) {
  //   setOgImage(head, ogImage)
  // }

  if (page) {
    Object.assign(pagination, getPagination(page))
  }
})
