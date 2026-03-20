import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content'
import { dayFromDate } from './dates'
import { tagsToDayKeys } from './tags'

export class Day {
  key: string
  posts: CollectionEntry<'posts'>[] = []
  meta?: CollectionEntry<'days'>
  commits: CollectionEntry<'commits'>[] = []
  youtube: CollectionEntry<'youtube'>[] = []
  tagMap: Map<string, CollectionEntry<CollectionKey>[]> = new Map
  
  constructor(key: string) {
    this.key = key
  }
}

let dayMap: Promise<Map<string, Day>>

export function getDayMap() {
  if (!dayMap) {
    dayMap = _getDayMap()
  }
  return dayMap
}

async function _getDayMap() {
  const [commits, youtube, posts, days] = await Promise.all([
    getCollection('commits'),
    getCollection('youtube'),
    getCollection('posts', ({ data: { draft = false } }) => !draft || import.meta.env.DEV),
    getCollection('days'),
  ])

  const dayMap = new Map<string, Day>()

  for (const entry of commits) {
    const { dayKey } = entry.data
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, new Day(dayKey)).get(dayKey)!
    dayEntry.commits.push(entry)
  }

  for (const entry of youtube) {
    const { dayKey } = entry.data
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, new Day(dayKey)).get(dayKey)!
    dayEntry.youtube.push(entry)
  }

  for (const entry of posts) {
    const dayKey = dayFromDate(entry.data.date, true)
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, new Day(dayKey)).get(dayKey)!
    dayEntry.posts.push(entry)
    console.log(dayKey)
  }

  for (const entry of days) {
    const dayKey = dayFromDate(entry.data.date, true)
    const dayEntry = dayMap.get(dayKey) ?? dayMap.set(dayKey, new Day(dayKey)).get(dayKey)!
    dayEntry.meta = entry
  }

  addTagMaps(dayMap)

  return dayMap
}

function addTagMaps(dayMap: Map<string, Day>) {
  for (const dayEntry of dayMap.values()) {
    for (const entry of [...dayEntry.posts, ...(dayEntry.meta ? [dayEntry.meta] : [])]) {
      entry.data.tags?.forEach(tag => {
        const list = dayEntry.tagMap.get(tag) ?? dayEntry.tagMap.set(tag, []).get(tag)!
        list.push(entry)
      })
    }
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

function _filterDayMap(dayMap: Map<string, Day>) {
  return new Map(
    dayMap.entries().filter(([dayKey]) => {
      const [year] = dayKey.split('-').map(Number)
      return year >= 2025
    })
  )
}
