import { getCollection, type CollectionEntry } from 'astro:content'
import type { StarlightPageProps } from '@astrojs/starlight/props'

export interface DayEntry {
  dayKey: string
  posts?: CollectionEntry<'posts'>[]
  day?: CollectionEntry<'days'>
  github?: CollectionEntry<'github'>
  youtube?: CollectionEntry<'youtube'>
}

export function slugFromDate(date: Date | string) {
  const { year, monthStrShort: mo, day } = partsFromDate(date)
  return `${year}/${mo.toLowerCase()}/${day}`
}

export function keyFromDate(date: Date | string) {
  const { year, month, day } = partsFromDate(date)
  const [mm, dd] = [month, day].map((v) => v.toString().padStart(2, '0'))
  return `${year}-${mm}-${dd}`
}

export async function getDayMap() {
  const [github, youtube, posts, days] = await Promise.all([
    getCollection('github'),
    getCollection('youtube'),
    getCollection('posts', ({ data }) => !data.draft || import.meta.env.DEV),
    getCollection('days'),
  ])

  const dayMap = new Map<string, DayEntry>()

  for (const entry of github) {
    const dayKey = entry.id
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, { dayKey }).get(dayKey)!
    Object.assign(dayEntry, { github: entry })
  }

  for (const entry of youtube) {
    const dayKey = entry.id
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, { dayKey }).get(dayKey)!
    Object.assign(dayEntry, { youtube: entry })
  }

  for (const entry of posts) {
    const dayKey = keyFromDate(entry.data.date)
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, { dayKey }).get(dayKey)!
    dayEntry.posts ??= []
    dayEntry.posts.push(entry)
  }

  for (const entry of days) {
    const dayKey = keyFromDate(entry.data.date)
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, { dayKey }).get(dayKey)!
    dayEntry.day = entry
  }

  return dayMap
}

export function filterDayMap(dayMap: Map<string, DayEntry>) {
  return new Map(dayMap.entries().filter(([dayKey]) => {
    const [year] = dayKey.split('-').map(Number)
    return year >= 2025
  }))
}

type CalendarStruct = Record<number, Record<number, string[]>>
type SidebarItem = NonNullable<StarlightPageProps['sidebar']>[number]

export function sidebarFromKeys(keys: string[], { collapsed = true } = {}) {
  const sidebarEmbryo = keys.reduce<CalendarStruct>(calendarStruct, {})
  const sidebar = Object.entries(sidebarEmbryo)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map<SidebarItem>(([year, yearStruct]) => ({
      label: year,
      collapsed,
      items: Object.entries(yearStruct)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([, dayKeys]) => {
          const { monthStrLong } = partsFromDate(dayKeys[0])
          return {
            label: monthStrLong,
            collapsed,
            items: dayKeys
              .map((k) => new Date(k))
              .sort((a, b) => b.getTime() - a.getTime())
              .map((date) => ({
                label: date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                }),
                link: `/${slugFromDate(date)}`,
              })),
          }
        }),
    }))

  if (!collapsed) {
    return sidebar
  }

  for (const year of sidebar) {
    if (typeof year === 'object' && 'items' in year && year.label.startsWith('20')) {
      year.collapsed = false
      for (const month of year.items) {
        if (typeof month === 'object' && 'items' in month) {
          month.collapsed = false
          break
        }
      }
      break
    }
  }
  return sidebar
}

function calendarStruct(struct: CalendarStruct, key: string) {
  const [year, month] = key.split('-').map(Number)

  struct[year] ??= {}
  struct[year][month] ??= []
  struct[year][month].push(key)

  return struct
}

function partsFromDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const utc = date.getUTCHours() === 0
  if (!utc && date.getHours() !== 0) {
    throw new Error(
      'To ensure predictable behavior, a date slug must parse to midnight local or UTC time. Use a plain date like 2026-03-01 or 3/1/2026.'
    )
  }

  return utc
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        day: date.getUTCDate(),
        monthStrShort: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
        monthStrLong: date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        monthStrShort: date.toLocaleDateString('en-US', { month: 'short' }),
        monthStrLong: date.toLocaleDateString('en-US', { month: 'long' }),
      }
}
