import type { Loader } from 'astro/loaders'
import uploads from '../../.days/youtube/uploads.json'
import shorts from '../../.days/youtube/shorts.json'

export function youtubeDays(): Loader {
  return {
    name: 'youtube',
    load: async ({ store }) => {
      let numShorts = 0
      const dayMap: Record<string, any> = {}
      for (const { snippet } of uploads) {
        const {
          publishedAt,
          title,
          description,
          thumbnails,
          resourceId: { videoId },
        } = snippet
        const dateId = getDateId(title, publishedAt)
        const isShort = shorts.some(({ snippet }) => snippet.resourceId.videoId === videoId)
        if (isShort) {
          numShorts++
        }
        if (!dayMap[dateId]) {
          dayMap[dateId] = []
        }
        dayMap[dateId].push({ videoId, title, description, thumbnails, publishedAt, isShort })
      }

      for (const [day, videos] of Object.entries(dayMap)) {
        store.set({ id: day, data: videos })
      }
    },
  }
}

function getDateId(title: string, publishedAt: string) {
  const matchDate = (string: string, pattern: RegExp) => {
    for (const match of string.matchAll(pattern)) {
      const date = new Date(match[0])
      if (!Number.isNaN(date.valueOf())) {
        return { date, match }
      }
    }
  }
  const dateFromTitle = (title: string, pubDate?: Date) => {
    // TODO: some nasty time-zone edge cases to work through
    const shortDatePattern = /(?<month>\d{1,2})\/(?<day>\d{1,2})(\/(?<year>\d{4}))?/g
    const longDatePattern = /(?<month>\w{3,}) (?<day>\d{1,2})(, (?<year>\d{4}))?/g

    const { date, match } =
      matchDate(title, shortDatePattern) ?? matchDate(title, longDatePattern) ?? {}
    if (!match || !date) {
      return
    }
    if (!match.groups?.year && pubDate) {
      // no explitic year in title so use the one from published date
      date.setFullYear(pubDate.getFullYear())
    }
    return date
  }

  const pubDate = new Date(publishedAt)
  const dateId = (dateFromTitle(title, pubDate) ?? pubDate).toLocaleDateString('en-CA') // YYYY-mm-dd
  return dateId
}
