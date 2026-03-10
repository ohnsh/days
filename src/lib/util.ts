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
  const [year, monthStr, day] = slug.split('/')
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
  const month = months.indexOf(monthStr.toLowerCase()) + 1
  return new Date(`${year}-${month}-${day}`)
}
