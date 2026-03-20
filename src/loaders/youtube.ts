import type { Loader } from 'astro/loaders'
import uploads from '../../.days/youtube/uploads.json'
import shorts from '../../.days/youtube/shorts.json'
import { z } from 'astro/zod'

const youtubeApiSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnails: z.object(),
  publishedAt: z.string(),
  isShort: z.boolean(),
  tags: z.array(z.string()).optional(),
})

export const youtubeSchema = youtubeApiSchema.extend({ dayKey: z.string() })

export function youtubeLoader(): Loader {
  return {
    name: 'youtube',
    load: async ({ store }) => {
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
        const tags = tagsFromText(title, description)

        const data = {
          videoId,
          dayKey,
          title,
          description,
          thumbnails,
          publishedAt,
          isShort,
          ...(tags.length > 0 ? { tags } : {}),
        }
        store.set({ id: videoId, data })
      }
    },
    schema: youtubeSchema,
  }
}

const emojiTest = /\p{Emoji}/v
function tagsFromText(title: string, description?: string) {
  const tags = new Set()
  // Here's a new one. Even modern, unicode-safe iteration over strings will split complex emoji into several characters.
  // (E.g. person, zero-width joiner, gender symbol.)
  // `Intl.Segmenter` allows iteration over 'user-perceived' characters or graphemes.
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  for (const { segment: char } of segmenter.segment(title)) {
    if (emojiTest.test(char)) {
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
  const longDatePattern = new RegExp(longDateTemplate, 'vig')
  const shortDatePattern = /(?<month>\d{1,2})\/(?<day>\d{1,2})\b(\/(?<year>\d{4}))?/gv

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
