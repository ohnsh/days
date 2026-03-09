import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import { getCollection, type CollectionEntry } from 'astro:content'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'

function extractOgImage(entry: CollectionEntry<'docs'>) {
  const { body, data } = entry
  if (data.ogImage) {
    return data.ogImage
  }
  const { videoId } = body?.match(/<YouTube\s+id="(?<videoId>[^"]+)"/)?.groups ?? {}
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  }
}

function setOgImage(head: StarlightRouteData['head'], ogImage: string) {
  head.push({ tag: 'meta', attrs: { property: 'og:image', content: ogImage } })
}

export const onRequest = defineRouteMiddleware(async (context) => {
  const { entry, head } = context.locals.starlightRoute

  const ogImage = extractOgImage(entry)
  if (ogImage) {
    setOgImage(head, ogImage)
  } else if (entry.id === 'index' || entry.id === '') {
    const docs = await getCollection('docs', ({ id }) => id !== 'index')
    docs.sort((a, b) => Number(b.data.date) - Number(a.data.date))
    for (const doc of docs) {
      const ogImage = extractOgImage(doc)
      if (ogImage) {
        setOgImage(head, ogImage)
        break
      }
    }
  }
})
