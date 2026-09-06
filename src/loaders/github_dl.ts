import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'
import type { Endpoints } from '@octokit/types'

async function api(url: URL | string, params?: Record<string, string>) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
  }

  if (params) {
    const _url = new URL(url)
    Object.entries(params).forEach(([key, val]) => {
      _url.searchParams.set(key, val)
    })
    url = _url
  }

  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    const json = await resp.json()
    throw new Error(json.message)
  }
  return resp
}

async function apiAllPages(url: URL | string, params?: Record<string, string>) {
  const nextPattern = /<(\S+)>; rel="next"/i
  const data = []
  let nextPage: string | undefined
  do {
    const resp = await api(nextPage ?? url, params)
    const json = await resp.json()
    data.push(...json)
    nextPage = resp.headers.get('link')?.match(nextPattern)?.[1]
  } while (nextPage)

  return data
}

type GithubRepos = Endpoints['GET /user/repos']['response']['data']
type ElementOf<T extends Array<any>> = T extends Array<infer R> ? R : never
type GithubRepo = ElementOf<GithubRepos>

// simpler
type GithubCommit = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'][number]

async function ghDownloader() {
  // ?sort=updated ?sort=pushed
  // ?since=timestamp only show repositories updated after the given time
  // 304 Not modified (?)

  // meant to be run as an npm script, so working dir should be predictable.
  // that's cool, right?
  await mkdir('.days/github/commits', { recursive: true })

  const reposFetched = (await apiAllPages(
    'https://api.github.com/user/repos?sort=pushed'
  )) as GithubRepo[]
  const reposSaved = (await Bun.file('.days/github/repos.json')
    .json()
    .catch(() => [])) as GithubRepo[]

  for (const repo of reposFetched) {
    const { full_name } = repo
    const saved = reposSaved.find((repo) => repo.full_name === full_name)

    if (saved && !isUpdated(repo, saved)) {
      // console.log(`${repo.name} not updated; skipping.`)
      continue
    }

    const { name, commits_url } = repo
    // https://docs.github.com/en/rest/commits/commits
    const url = new URL(commits_url.replaceAll(/{[^}]+}/g, '')) /* ?author=ohnsh */
    const savedCommits: GithubCommit[] = saved
      ? await Bun.file(`.days/github/commits/${name}.json`).json()
      : undefined
    let commits: GithubCommit[]

    if (!savedCommits || savedCommits.length === 0) {
      console.log(`${name} not saved; fetching all.`)
      url.searchParams.set('per_page', '50')
      commits = await apiAllPages(url).then((commits) =>
        commits.filter((commit) => isMyCommit(commit))
      )
    } else {
      const [latestCommit] = savedCommits
      const { sha } = latestCommit
      const { date } = latestCommit.commit.author ?? {}

      url.searchParams.set('per_page', '10')
      if (date) {
        url.searchParams.set('since', date)
      }

      console.log(`${name} cache out of date; fetching new commits since ${date}`)
      const newCommits = await apiAllPages(url).then((commits) =>
        commits.filter((commit) => commit.sha !== sha && isMyCommit(commit))
      )
      console.log(`${newCommits.length} new commits; ${savedCommits.length} saved commits.`)
      commits = [...newCommits, ...savedCommits]
    }

    await Bun.file(`.days/github/commits/${name}.json`).write(JSON.stringify(commits))
  }
  await Bun.file('.days/github/repos.json').write(JSON.stringify(reposFetched))
}

function isMyCommit(commit: GithubCommit) {
  if (!commit.commit.author) return false

  const { name, email } = commit.commit.author
  if (!name || !email) return false

  const [_user, host] = email.split('@')
  return (
    name.toLowerCase() === 'jonathan sherrell' ||
    name.toLowerCase() === 'john sherrell' ||
    host === 'ohn.sh' ||
    host === 'jom.sh' ||
    host === 'jomsh.cc'
  )
}

function isUpdated(repo: GithubRepo, savedRepo: GithubRepo) {
  if (!repo.pushed_at) return false
  if (!savedRepo.pushed_at) return true
  return new Date(repo.pushed_at).getTime() > new Date(savedRepo.pushed_at).getTime()
}

await ghDownloader()
