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

export function dateFromSlug(slug: string) {
  slug = slug.replace(/^[/]+/, '')
  const [year, monthStr, day] = slug.split('/')
  if (!year || !monthStr || !day) {
    return
  }
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const month = String(months.indexOf(monthStr.toLowerCase()) + 1)
  const dateIdGuess = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const date = new Date(dateIdGuess)
  if (Number.isNaN(date.valueOf())) {
    return
  }
  return date
}

export function dateIdFromSlug(slug: string) {
  const date = dateFromSlug(slug)
  if (!date) {
    return
  }
  return dateIdFromDate(date)
}

export function dateIdFromDate(date: Date) {
  const [dateId] = date.toISOString().split('T')
  return dateId
}

export function dateIdFromProp(date?: string | Date) {
  if (!date) {
    return
  }
  if (typeof date === 'string') {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }
    date = new Date(date)
  }
  return dateIdFromDate(date)
}

export function dateIdFromAstroLocals(astroLocals) {
  try {
    const { data } = astroLocals.starlightRoute.entry
    return dateIdFromDate(data.date)
  } catch (_e) {
    return
  }
}
