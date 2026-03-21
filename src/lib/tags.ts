import { getCollection } from 'astro:content'
import type { Day } from './days'

export const collections = {
  posts: getCollection('posts').then(getTagMap),
  days: getCollection('days').then(getTagMap),
}

export const aggregated = Promise.all(Object.values(collections)).then(aggregateTagMaps)

type TaggedEntry = { data: { tags?: string[] } }
export function getTagMap<E extends TaggedEntry>(entries: E[]) {
  const map = new Map<string, E[]>()
  entries.forEach((entry) => {
    const { tags = [] } = entry.data
    tags.forEach((tag) => {
      const list = map.get(tag) ?? map.set(tag, []).get(tag)!
      list.push(entry)
    })
  })
  return map
}

export function aggregateTagMaps(maps: Map<string, TaggedEntry[]>[]) {
  const aggMap = new Map<string, TaggedEntry[]>()
  for (const map of maps) {
    for (const [tag, list] of map) {
      const aggList = aggMap.get(tag) ?? aggMap.set(tag, []).get(tag)!
      aggList.push(...list)
    }
  }
  return aggMap
}

export function tagsToDayKeys(dayMap: Map<string, Day>) {
  const tagDayMap = new Map<string, string[]>()
  for (const [key, entry] of dayMap) {
    for (const tag of entry.tagMap?.keys() ?? []) {
      const list = tagDayMap.get(tag) ?? tagDayMap.set(tag, []).get(tag)!
      list.push(key)
    }
  }
  return tagDayMap
}
