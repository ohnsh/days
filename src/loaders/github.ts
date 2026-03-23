import type { Loader } from 'astro/loaders'
import { z } from 'astro/zod'
import repos from '../../.days/github/repos.json'
import { dayFromDate } from '@/lib/dates'
const commitDb = import.meta.glob('../../.days/github/commits/*.json', { eager: true })

export const repoSchema = githubRepoSchema()
export const commitSchema = githubCommitSchema().extend({ day: z.string(), repo: z.string() })
export type Commit = z.infer<typeof commitSchema>

export function commitLoader(): Loader {
  return {
    name: 'commits',
    load: async ({ store }) => {
      for (const repo of repos) {
        for (const apiCommit of getCommits(repo.name)) {
          const { date } = apiCommit.commit.author
          const commit: Commit = { ...apiCommit, repo: repo.full_name, day: dayFromDate(date, false) }
          store.set({ id: commit.sha, data: commit })
        }
      }
    },
    schema: commitSchema,
  }
}

export function repoLoader(): Loader {
  return {
    name: 'repos',
    load: async ({ store }) => {
      for (const repo of repos) {
        store.set({ id: repo.full_name, data: repo })
      }
    },
    schema: repoSchema,
  }
}

function getCommits(repo: string) {
  const path = `../../.days/github/commits/${repo}.json`
  const { default: commits } = commitDb[path]

  if (!Array.isArray(commits)) {
    console.error(`JSON for ${repo} isn't an array.`)
    return []
  }

  return commits
}

function githubCommitSchema() {
  return z.object({
    sha: z.string(),
    commit: z.object({
      author: z.object({ name: z.string(), email: z.string(), date: z.string() }),
      message: z.string(),
      tree: z.object({ sha: z.string(), url: z.string() }),
      url: z.string(),
      // verification
    }),
    url: z.string(),
    html_url: z.string(),
    author: z.object({ login: z.string(), url: z.string(), html_url: z.string() }),
    parents: z.object({ sha: z.string(), url: z.string(), html_url: z.string() }),
  })
}

function githubRepoSchema() {
  return z.object({
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    url: z.string(),
    html_url: z.string(),
    commits_url: z.string(),
    branches_url: z.string(),
    owner: z.object({ login: z.string(), url: z.string(), html_url: z.string() }),
    description: z.string(),
    fork: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    pushed_at: z.string(),
    homepage: z.string().optional(),
    size: z.number(),
    language: z.string(),
    has_pages: z.boolean(),
    archived: z.boolean(),
    disabled: z.boolean(),
    visibility: z.string(),
    forks: z.number(),
    topics: z.array(z.string()),
    default_branch: z.string(),
  })
}
