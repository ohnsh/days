import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

export const onRequest = defineRouteMiddleware((context) => {
  const { entry, head } = context.locals.starlightRoute
  const { id, body, data } = entry

  if (!data.ogImage) {
    const { videoId } = body?.match(/<YouTube\s+id="(?<videoId>[^"]+)"/)?.groups ?? {}
    if (videoId) {
      data.ogImage = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    }
  }
  if (!data.ogImage) {
    return
  }
  head.push({ tag: 'meta', attrs: { property: 'og:image', content: data.ogImage } })
})
