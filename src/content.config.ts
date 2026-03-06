import { defineCollection, z } from 'astro:content'
import type { Loader } from 'astro/loaders'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'

// Trying to avoid redundant frontmatter. Idk about mutating the sidebar object. Needs work.
const loader: Loader = {
  name: 'shim',
  load: async (context) => {
    await docsLoader().load(context)
    context.store
      .values()
      .filter(({ id, data: { date } }) => id.startsWith('202') && date)
      .forEach(({ data }) => {
        const { date, sidebar } = data as { date: Date; sidebar: {} }
        const localDate = new Date(date)
        localDate.setMinutes(date.getMinutes() + date.getTimezoneOffset())
        sidebar.order = 31 - localDate.getDate()
        sidebar.label = localDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })
        // data.date = localDate
      })
  },
}

const opts: Parameters<typeof docsSchema>[0] = {
  extend: z.object({ date: z.date().optional(), ogImage: z.string().url().optional() }),
  // }).transform(({ date }) => ({
  // 	date: date?.toISOString(),
  // })),
}

export const collections = { docs: defineCollection({ loader, schema: docsSchema(opts) }) }
