import { slugFromDate, partsFromDate } from './dates'
import { sidebarTemplate, type SidebarConfig } from './const'

function applySidebarTemplate(sidebar: SidebarConfig) {
  return sidebarTemplate.flatMap((item) => {
    if (typeof item !== 'object' || !('label' in item)) {
      return item
    }
    return item.label === '<slot />' ? sidebar : item
  })
}

type CalendarStruct = Record<number, Record<number, string[]>>
type SidebarItem = SidebarConfig[number]

export function sidebarFromKeys(...args: Parameters<typeof _sidebarFromKeys>) {
  return applySidebarTemplate(_sidebarFromKeys(...args))
}

function _sidebarFromKeys(keys: string[], { collapsed = true } = {}) {
  const sidebarEmbryo = keys.reduce<CalendarStruct>(calendarStruct, {})
  const sidebar = Object.entries(sidebarEmbryo)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map<SidebarItem>(([year, yearStruct]) => ({
      label: year,
      collapsed,
      items: Object.entries(yearStruct)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([, dayKeys]) => {
          return {
            label: partsFromDate(dayKeys[0]).monthLong,
            collapsed,
            items: dayKeys
              .map((k) => new Date(k))
              .sort((a, b) => b.getTime() - a.getTime())
              .map((date) => ({
                label: date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                }),
                link: `/${slugFromDate(date)}`,
              })),
          }
        }),
    }))

  if (!collapsed) {
    return sidebar
  }

  for (const year of sidebar) {
    if (typeof year === 'object' && 'items' in year && year.label.startsWith('20')) {
      year.collapsed = false
      for (const month of year.items) {
        if (typeof month === 'object' && 'items' in month) {
          month.collapsed = false
          break
        }
      }
      break
    }
  }
  return sidebar
}

function calendarStruct(struct: CalendarStruct, key: string) {
  const [year, month] = key.split('-').map(Number)

  struct[year] ??= {}
  struct[year][month] ??= []
  struct[year][month].push(key)

  return struct
}