import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { commitLoader, commitSchema, repoLoader, repoSchema } from '@/loaders/github'
import { youtubeLoader, youtubeSchema } from '@/loaders/youtube'
import { dayFromDate } from './lib/dates'

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
})
const days = defineCollection({
  loader: glob({ base: './src/content/days', pattern: '**/*.yml' }),
  schema: z
    .object({
      date: z.date(),
      tags: z.array(z.string()).optional(),
      ogImage: z.url().optional(),
      youtube: z.array(z.looseObject({})).optional(),
    })
    .transform((data) => ({ ...data, day: dayFromDate(data.date, true) })),
})
// const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() })
const repos = defineCollection({ loader: repoLoader(), schema: repoSchema })
const commits = defineCollection({ loader: commitLoader(), schema: commitSchema })
const youtube = defineCollection({ loader: youtubeLoader(), schema: youtubeSchema })

export const collections = { days, posts, /*docs,*/ commits, repos, youtube }
