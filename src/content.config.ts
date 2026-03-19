import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { commitLoader, githubDays } from '@/loaders/github'
import { youtubeLoader } from '@/loaders/youtube'
import { keyFromDate } from './lib/dates'

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
    .object({ date: z.date(), tags: z.array(z.string()), ogImage: z.url().optional() })
    .transform((data) => ({ ...data, day: keyFromDate(data.date) })),
})
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() })
const github = defineCollection({ loader: githubDays() })
const commits = defineCollection({ loader: commitLoader() })
const youtube = defineCollection({ loader: youtubeLoader() })

export const collections = { days, posts, docs, commits, github, youtube }
