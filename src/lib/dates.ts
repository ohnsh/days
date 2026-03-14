export function slugFromDate(date: Date | string) {
  const { year, monthShort, day } = partsFromDate(date)
  return `${year}/${monthShort.toLowerCase()}/${day}`
}

export function keyFromDate(_date: Date | string) {
  const { date, isUTC } = normalizeDate(_date)
  return date.toLocaleDateString('en-CA', isUTC ? { timeZone: 'UTC' } : undefined)
}

export function titleFromDayKey(dayKey: string) {
  const { date, isUTC } = normalizeDate(dayKey)
  const now = new Date()
  const sigYear = now.getFullYear() - 1
  if (
    date.getFullYear() < sigYear ||
    (date.getFullYear() === sigYear && date.getMonth() <= now.getMonth())
  ) {
    return date.toLocaleDateString('en-US', {
      dateStyle: 'full',
      ...(isUTC ? { timeZone: 'UTC' } : {}),
    })
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(isUTC ? { timeZone: 'UTC' } : {}),
  })
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
