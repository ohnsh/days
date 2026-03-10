import { getCollection } from 'astro:content'

export async function getPosts(drafts = true) {
  const posts = await getCollection(
    'docs',
    ({ id, data }) => id !== 'index' && (drafts || !data.draft || import.meta.env.DEV)
  )
  posts.sort((a, b) => Number(b.data.date) - Number(a.data.date))
  return posts
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
  console.log({ dateIdGuess })
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
