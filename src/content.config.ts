import { defineCollection, z } from 'astro:content'
import type { Loader } from 'astro/loaders'
import type { CollectionEntry } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { githubDays } from '@/loaders/github'
import { dateFromSlug } from './lib/util'

// Trying to avoid redundant frontmatter. Idk about mutating the sidebar object. Needs work.
const loader: Loader = {
  name: 'shim',
  load: async (context) => {
    await docsLoader().load(context)
    context.store.values().forEach((entry) => {
      const { id, data } = entry as CollectionEntry<'docs'>
      const { date = dateFromSlug(id), sidebar } = data

      sidebar.order = 31 - date.getUTCDate()
      sidebar.label = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })

      // yikes
      const digest = `${entry.digest}1`
      context.store.set({ ...entry, digest, data: { ...data, date } })
    })
  },
}

const docs = defineCollection({
  loader,
  schema: docsSchema({
    extend: z.object({
      date: z.date(),
      ogImage: z.string().url().optional(),
    }),
  }),
})
const github = defineCollection({ loader: githubDays() })

export const collections = { docs, github }
