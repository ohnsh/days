import type { CollectionEntry } from 'astro:content'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'

export function extractOgImage(entry: CollectionEntry<'docs'>) {
  const { body, data } = entry
  if (data.ogImage) {
    return data.ogImage
  }
  const { videoId } = body?.match(/<YouTube\s+id="(?<videoId>[^"]+)"/)?.groups ?? {}
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  }
}

export function setOgImage(head: StarlightRouteData['head'], ogImage: string) {
  head.push({ tag: 'meta', attrs: { property: 'og:image', content: ogImage } })
}
