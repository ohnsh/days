import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { githubDays } from '@/loaders/github'
import { youtubeDays } from '@/loaders/youtube'

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
})
const days = defineCollection({
  loader: glob({ base: './src/content/days', pattern: '**/*.yml' }),
  schema: z.object({
    date: z.date(),
    tags: z.array(z.string()),
    ogImage: z.url().optional(),
  })
})
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
})
const github = defineCollection({ loader: githubDays() })
const youtube = defineCollection({
  loader: youtubeDays(),
  schema: z.array(
    z.object({
      videoId: z.string(),
      title: z.string(),
      description: z.string(),
      thumbnails: z.object(),
      publishedAt: z.string(),
      isShort: z.boolean(),
      tags: z.array(z.string()).optional(),
    })
  ),
})

export const collections = { days, posts, docs, github, youtube }
