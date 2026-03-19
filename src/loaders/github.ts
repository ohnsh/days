import type { Loader } from 'astro/loaders'
import { z } from 'astro/zod'
import repos from '../../.days/github/repos.json'
const commitDb = import.meta.glob('../../.days/github/commits/*.json', { eager: true })

const RepoSchema = z.object({
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

const gitCommitSchema = z.object({
  author: z.object({ name: z.string(), email: z.string(), date: z.string() }),
  message: z.string(),
  tree: z.object({ sha: z.string(), url: z.string() }),
  url: z.string(),
  // verification
})

export const CommitSchema = z.object({
  sha: z.string(),
  commit: gitCommitSchema,
  url: z.string(),
  html_url: z.string(),
  author: z.object({ login: z.string(), url: z.string(), html_url: z.string() }),
  parents: z.object({ sha: z.string(), url: z.string(), html_url: z.string() }),
})

type Repo = z.infer<typeof RepoSchema>
type Commit = z.infer<typeof CommitSchema>

export function commitLoader(): Loader {
  return {
    name: 'commits',
    load: async ({ store }) => {
      for (const repo of repos as Repo[]) {
        for (const commit of getCommits(repo.name)) {
          store.set({ id: commit.sha, data: commit })
        }
      }
    },
    schema: CommitSchema,
  }
}

export function githubDays(): Loader {
  return {
    name: 'github',
    load: async ({ store }) => {
      const dayMap: Record<string, any> = {}
      for (const repo of repos) {
        const repoDayMap = await getRepoDays(repo)
        for (const [day, commits] of Object.entries(repoDayMap)) {
          if (!dayMap[day]) {
            dayMap[day] = []
          }
          dayMap[day].push({ repo, commits })
        }
      }

      for (const [day, repos] of Object.entries(dayMap)) {
        store.set({ id: day, data: repos })
      }
    },
  }
}

function getCommits(repo: string): Commit[] {
  const path = `../../.days/github/commits/${repo}.json`
  const { default: commits } = commitDb[path]

  if (!Array.isArray(commits)) {
    console.error(`JSON for ${repo} isn't an array.`)
    return []
  }

  return commits
}

async function getRepoDays(repo) {
  const { name } = repo
  const path = `../../.days/github/commits/${name}.json`
  const { default: commits } = commitDb[path]

  if (!Array.isArray(commits)) {
    return {}
  }
  return commits.reduce((map, commit) => {
    const {
      author: { name, email, date: timestamp },
    } = commit.commit
    const date = new Date(timestamp)
    const dateId = date.toLocaleDateString('en-CA') // YYYY-mm-dd
    if (!map[dateId]) {
      map[dateId] = []
    }
    map[dateId].push(commit)
    return map
  }, {})
}
