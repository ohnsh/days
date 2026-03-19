import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content'
import { keyFromDate } from './dates'
import { getTagMap, aggregateTagMaps, tagsToDayKeys } from './tags'

// export interface DayEntry {
//   dayKey: string
//   posts?: CollectionEntry<'posts'>[]
//   day?: CollectionEntry<'days'>
//   github?: CollectionEntry<'github'>
//   youtube?: CollectionEntry<'youtube'>
//   tagMap?: Map<string, CollectionEntry<CollectionKey>>
// }

export class DayEntry {
  day: string
  posts: CollectionEntry<'posts'>[] = []
  meta?: CollectionEntry<'days'>
  commits: CollectionEntry<'commits'>[] = []
  youtube: CollectionEntry<'youtube'>[] = []
  tagMap: Map<string, CollectionEntry<CollectionKey>[]> = new Map
  
  constructor(day: string) {
    this.day = day
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
    getCollection('commits'),
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
    console.log(entry.data.day)
    const dayKey = keyFromDate(entry.data.date)
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, { dayKey }).get(dayKey)!
    dayEntry.day = entry
  }

  addTagMaps(dayMap)

  return dayMap
}

function addTagMaps(dayMap: Map<string, DayEntry>) {
  for (const dayEntry of dayMap.values()) {
    const dayTags = getTagMap(dayEntry.day ? [dayEntry.day] : [])
    const postTags = getTagMap(dayEntry.posts ?? [])
    const tagMap = aggregateTagMaps([dayTags, postTags])
    Object.assign(dayEntry, { tagMap })
  }
}

let filteredDayMap: typeof dayMap

export const tagDayMap = getFilteredDayMap().then(tagsToDayKeys)
export function getFilteredDayMap() {
  if (!filteredDayMap) {
    filteredDayMap = getDayMap().then(_filterDayMap)
  }
  return filteredDayMap
}

function _filterDayMap(dayMap: Map<string, DayEntry>) {
  return new Map(
    dayMap.entries().filter(([dayKey]) => {
      const [year] = dayKey.split('-').map(Number)
      return year >= 2025
    })
  )
}
