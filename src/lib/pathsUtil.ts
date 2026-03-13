import { getCollection, type CollectionEntry } from 'astro:content'
import type { StarlightPageProps } from '@astrojs/starlight/props'

type CalendarStruct = Record<number, Record<number, Date[]>>
type SidebarItem = NonNullable<StarlightPageProps['sidebar']>[number]

export interface DayEntry {
  posts?: CollectionEntry<'posts'>[]
  day?: CollectionEntry<'days'>
  github?: CollectionEntry<'github'>
  youtube?: CollectionEntry<'youtube'>
}

function slugFromDate(date: Date) {
  const [dateStr] = date.toISOString().split('T')
  return dateStr.replaceAll('-', '/')
}

function structureDateSlugs(struct: CalendarStruct, slug: string) {
  const date = new Date(slug)
  if (date.getHours() !== 0) {
    throw new Error(
      'To ensure predictable behavior, a date slug must parse to midnight local time. Expected a plain date like `yyyy/M/d`.'
    )
  }
  const [year, month, day] = [date.getFullYear(), date.getMonth(), date.getDate()]

  struct[year] ??= {}
  struct[year][month] ??= []
  struct[year][month].push(date)

  return struct
}

export async function getStaticDayPaths() {
  const [github, youtube, posts, days] = await Promise.all([
    getCollection('github'),
    getCollection('youtube'),
    getCollection('posts', ({ data }) => !data.draft || import.meta.env.DEV),
    getCollection('days'),
  ])

  const dayMap = new Map<string, DayEntry>()

  for (const entry of github) {
    const dateSlug = entry.id.replaceAll('-', '/')
    const dayEntry = dayMap.get(dateSlug) ?? dayMap.set(dateSlug, {}).get(dateSlug)!
    Object.assign(dayEntry, { github: entry })
  }

  for (const entry of youtube) {
    const dateSlug = entry.id.replaceAll('-', '/')
    const dayEntry = dayMap.get(dateSlug) ?? dayMap.set(dateSlug, {}).get(dateSlug)!
    Object.assign(dayEntry, { youtube: entry })
  }

  for (const entry of posts) {
    const dateSlug = slugFromDate(entry.data.date)
    const dayEntry = dayMap.get(dateSlug) ?? dayMap.set(dateSlug, {}).get(dateSlug)!
    dayEntry.posts ??= []
    dayEntry.posts.push(entry)
  }

  for (const entry of days) {
    const dateSlug = slugFromDate(entry.data.date)
    const dayEntry = dayMap.get(dateSlug) ?? dayMap.set(dateSlug, {}).get(dateSlug)!
    dayEntry.day = entry
  }

  const sidebarEmbryo = dayMap.keys().reduce<CalendarStruct>(structureDateSlugs, {})
  const sidebar = Object.entries(sidebarEmbryo)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map<SidebarItem>(([year, yearStruct]) => ({
      label: year,
      items: Object.entries(yearStruct)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([, dates]) => {
          const month = dates[0].toLocaleDateString('en-US', { month: 'long' })
          const mo = dates[0].toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
          return {
            label: month,
            items: dates
              .sort((a, b) => b.getTime() - a.getTime())
              .map((date) => ({
                label: date.toLocaleDateString(),
                link: `/${year}/${mo}/${date.getDate()}`,
              })),
          }
        }),
    }))

  const paths = [...dayMap.entries()].map(([dateSlug, dayEntry]) => ({
    params: { slug: dateSlug },
    props: { day: dayEntry, sidebar },
  }))

  return paths
}
