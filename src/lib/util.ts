export function dateFromSlug(slug: string) {
  const [year, monthStr, day] = slug.split('/')
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const month = months.indexOf(monthStr.toLowerCase()) + 1
  return new Date(`${year}-${month}-${day}`)
}