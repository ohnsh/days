// only for plain date strings like '2026-03-21'
export function slugFromDay(key: string) {
  if (/(\d{4})-(\d{2})-(\d{2})/.test(key)) {
    return key.replaceAll('-', '/')
  }
  return slugFromDate(key, true)
}

// `dayFromDate()` and `slugFromDate()` work with either full timestamps (which are fine to
//   implicitly convert to local time) or plain dates (which are important to represent the way
//   they were originally typed out). You explicitly specify whether it's a `plainDate` using a
//   second parameter (default false). If so, it's normalized to midnight UTC so that later
//   string extraction knows to always use UTC getters.
export function slugFromDate(date: Date | string, plainDate: boolean) {
  if (plainDate) {
    date = normalizePlainDate(date)
  } else if (typeof date === 'string') {
    date = new Date(date)
  }

  const mmddyyyy = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    ...(plainDate && { timeZone: 'UTC' }),
  })
  const [month, day, year] = mmddyyyy.split('/')
  return `${year}/${month}/${day}`
}

export function legacySlugFromDate(date: Date | string, plainDate: boolean) {
  if (plainDate) {
    date = normalizePlainDate(date)
  }
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const { year, month, day } = plainDate
    ? {
        year: date.getUTCFullYear(),
        month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
        day: date.getUTCDate(),
      }
    : {
        year: date.getFullYear(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.getDate(),
      }

  return `${year}/${month.toLowerCase()}/${day}`
}

export function dayFromDate(date: Date | string, plainDate: boolean) {
  if (plainDate) {
    return normalizePlainDate(date).toLocaleDateString('en-CA', { timeZone: 'UTC' })
  }
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleDateString('en-CA')
}

export function queryDay(day: string, opts: Intl.DateTimeFormatOptions = {}) {
  return normalizePlainDate(day).toLocaleDateString('en-US', opts)
}

export function titleFromDay(day: string) {
  const date = normalizePlainDate(day)
  const now = new Date()
  const sigYear = now.getFullYear() - 1
  if (
    date.getUTCFullYear() < sigYear ||
    (date.getUTCFullYear() === sigYear && date.getUTCMonth() <= now.getMonth())
  ) {
    return date.toLocaleDateString('en-US', { dateStyle: 'full', timeZone: 'UTC' })
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function normalizePlainDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const isUTC = date.getUTCHours() === 0
  if (!isUTC && date.getHours() !== 0) {
    throw new Error(
      'Dates passed to normalizePlainDate() must parse to midnight local or UTC time. Use a plain date like 2026-03-01 or 3/1/2026.'
    )
  }

  return isUTC ? date : new Date(`${date.toLocaleDateString('en-CA')}T00:00:00Z`)
}
