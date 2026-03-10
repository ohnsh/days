import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import { getPosts } from '@/lib/util'
import type { CollectionEntry } from 'astro:content'
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
    const posts = await getPosts()
    for (const post of posts) {
      const ogImage = extractOgImage(post)
      if (ogImage) {
        setOgImage(head, ogImage)
        break
      }
    }
  }
})
