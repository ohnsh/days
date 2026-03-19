import { slugFromDate, queryDay } from './dates'
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
type SidebarOpts = { collapsed?: boolean }

export function sidebarFrom(dayKeys: string[], tags?: string[], opts?: SidebarOpts) {
  const items = _sidebarFromKeys(dayKeys, opts)
  if (tags) {
    items.unshift(_sidebarFromTags(tags))
  }
  return applySidebarTemplate(items)
}

function _sidebarFromKeys(keys: string[], { collapsed = true } = {}) {
  const sidebarEmbryo = keys.reduce<CalendarStruct>(keyReducer, {})
  const sidebar = Object.entries(sidebarEmbryo)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map<SidebarItem>(([year, yearStruct]) => ({
      label: year,
      collapsed,
      items: Object.entries(yearStruct)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([, dayKeys]) => {
          return {
            label: queryDay(dayKeys[0], { month: 'long' }),
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

function _sidebarFromTags(tags: string[]) {
  return {
    label: 'Tags',
    collapsed: true,
    items: tags.map(tag => ({
      label: tag,
      link: `/tags/${tag}`
    }))
  }
}

function keyReducer(struct: CalendarStruct, key: string) {
  const [year, month] = key.split('-').map(Number)

  struct[year] ??= {}
  struct[year][month] ??= []
  struct[year][month].push(key)

  return struct
}