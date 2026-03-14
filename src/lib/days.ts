import { getCollection, type CollectionEntry } from 'astro:content'

export interface DayEntry {
  dayKey: string
  posts?: CollectionEntry<'posts'>[]
  day?: CollectionEntry<'days'>
  github?: CollectionEntry<'github'>
  youtube?: CollectionEntry<'youtube'>
}

export function slugFromDate(date: Date | string) {
  const { year, monthShort, day } = partsFromDate(date)
  return `${year}/${monthShort.toLowerCase()}/${day}`
}

export function keyFromDate(_date: Date | string) {
  const { date, isUTC } = normalizeDate(_date)
  return date.toLocaleDateString('en-CA', isUTC ? { timeZone: 'UTC' } : undefined)
}

export function partsFromDate(_date: Date | string) {
  const { date, isUTC } = normalizeDate(_date)
  return isUTC
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        monthShort: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
        monthLong: date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
        monthLong: date.toLocaleDateString('en-US', { month: 'long' }),
      }
}

let dayMap: Promise<Map<string, DayEntry>>

export function getDayMap() {
  if (!dayMap) {
    dayMap = _getDayMap()
  }
  return dayMap
}

async function _getDayMap() {
  const [github, youtube, posts, days] = await Promise.all([
    getCollection('github'),
    getCollection('youtube'),
    getCollection('posts', ({ data: { draft = false } }) => !draft || import.meta.env.DEV),
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

let filteredDayMap: typeof dayMap

export function getFilteredDayMap() {
  if (!filteredDayMap) {
    filteredDayMap = getDayMap().then(_filterDayMap)
  }
  return filteredDayMap
}

function _filterDayMap(dayMap: Map<string, DayEntry>) {
  return new Map(dayMap.entries().filter(([dayKey]) => {
    const [year] = dayKey.split('-').map(Number)
    return year >= 2025
  }))
}

function normalizeDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const isUTC = date.getUTCHours() === 0
  if (!isUTC && date.getHours() !== 0) {
    throw new Error(
      'To ensure predictable behavior, a date slug must parse to midnight local or UTC time. Use a plain date like 2026-03-01 or 3/1/2026.'
    )
  }

  return { date, isUTC }
}
