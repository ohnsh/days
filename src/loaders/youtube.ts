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
        const dayKey = getDayKey(title, publishedAt)
        const isShort = shorts.some(({ snippet }) => snippet.resourceId.videoId === videoId)
        if (isShort) {
          numShorts++
        }
        if (!dayMap[dayKey]) {
          dayMap[dayKey] = []
        }
        const tags = tagsFromText(title, description)

        dayMap[dayKey].push({
          videoId,
          title,
          description,
          thumbnails,
          publishedAt,
          isShort,
          ...(tags.length > 0 ? { tags } : {}),
        })
      }

      for (const [day, videos] of Object.entries(dayMap)) {
        store.set({ id: day, data: videos })
      }
    },
  }
}

function tagsFromText(title: string, description?: string) {
  const tags = new Set
  // Here's a new one. Even modern, unicode-safe iteration over strings will split complex emoji into several characters.
  // (E.g. person, zero-width joiner, gender symbol.)
  // `Intl.Segmenter` allows iteration over 'user-perceived' characters or graphemes.
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  for (const { segment: char } of segmenter.segment(title)) {
    if (char.length > 1) {
      tags.add(char)
    } else {
      break
    }
  }
  return [...tags]
}

function getDayKey(title: string, publishedAt: string) {
  const pubDate = new Date(publishedAt)
  return (dateFromTitle(title, pubDate) ?? pubDate).toLocaleDateString('en-CA') // YYYY-mm-dd
}

function dateFromTitle(title: string, pubDate?: Date) {
  const longDateTemplate = `(?<month>${monthsPattern()})[.]? (?<day>\\d{1,2})\\b(, (?<year>\\d{4}))?`
  const longDatePattern = new RegExp(longDateTemplate, 'ig')
  const shortDatePattern = /(?<month>\d{1,2})\/(?<day>\d{1,2})\b(\/(?<year>\d{4}))?/g

  const { date, match } =
    matchDate(title, shortDatePattern) ?? matchDate(title, longDatePattern) ?? {}
  if (!match || !date) {
    return
  }

  if (!match.groups?.year && pubDate) {
    // no explitic year in title so use the one from published date
    date.setFullYear(computeImplicitYear(date, pubDate))
  }
  return date
}

function monthsPattern() {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months
    .map((month) => month.slice(0, 3))
    .concat(months)
    .join('|')
}

function matchDate(string: string, pattern: RegExp) {
  for (const match of string.matchAll(pattern)) {
    const date = new Date(match[0])
    if (!Number.isNaN(date.valueOf())) {
      return { date, match }
    }
  }
}

// pubDate year might be off by one relative to implicit year (December/January or January/December).
// Simply find which year makes the date closest to the pubDate.
function computeImplicitYear(date: Date, refDate: Date) {
  const baseYear = refDate.getFullYear()
  const years = [baseYear - 1, baseYear, baseYear + 1]
  const [[implicitYear]] = years
    .map((year) => {
      const d = new Date(date)
      d.setFullYear(year)
      return [year, Math.abs(refDate.getTime() - d.getTime())]
    })
    .sort(([, a], [, b]) => a - b)

  // console.log({ date, refDate, implicitYear })
  return implicitYear
}
