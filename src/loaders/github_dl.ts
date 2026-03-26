import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'

async function api(url: URL | string) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
  }

  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    const json = await resp.json()
    throw new Error(json.message)
  }
  return resp
}

async function apiAllPages(url: URL | string) {
  const nextPattern = /<(\S+)>; rel="next"/i
  const data = []
  let nextPage: string | undefined
  do {
    const resp = await api(nextPage ?? url)
    const json = await resp.json()
    data.push(...json)
    nextPage = resp.headers.get('link')?.match(nextPattern)?.[1]
  } while (nextPage)

  return data
}

// https://docs.github.com/en/rest/commits/commits
async function repoLatest(repo: string) {
  const json = await Bun.file(`.days/github/commits/${repo}.json`).json()
  const [latestCommit] = json
  const { date } = latestCommit.commit.author
  // `since` is a query parameter to commits endpoint
  const since = date
}

async function ghDownloader() {
  // ?sort=updated ?sort=pushed
  // ?since=timestamp only show repositories updated after the given time
  // 304 Not modified (?)
  await mkdir('.days/github/commits', { recursive: true })

  const reposFetched = await apiAllPages('https://api.github.com/user/repos?sort=updated')
  const reposSaved = await Bun.file('.days/github/repos.json')
    .json()
    .catch((e) => [])

  for (const repo of reposFetched) {
    const { full_name, updated_at } = repo
    const saved = reposSaved.find((repo) => repo.full_name === full_name)

    if (!saved || isUpdated(updated_at, saved.updated_at)) {
      const { name, commits_url } = repo
      const url = new URL(commits_url.replaceAll(/{[^}]+}/g, '')) /* ?author=ohnsh */
      url.searchParams.set('per_page', '50')

      const commits = await apiAllPages(url).then((commits) =>
        commits.filter(({ commit }) => isMyCommit(commit))
      )
      await Bun.file(`.days/github/commits/${name}.json`).write(JSON.stringify(commits))
    }
  }
  await Bun.file('.days/github/repos.json').write(JSON.stringify(reposFetched))
}

function isMyCommit(commit) {
  const { name, email } = commit.author
  const [_user, host] = email.split('@')
  return (
    name.toLowerCase() === 'jonathan sherrell' ||
    name.toLowerCase() === 'john sherrell' ||
    host === 'ohn.sh' ||
    host === 'jom.sh' ||
    host === 'jomsh.cc'
  )
}

function isUpdated(fetchedTS: string, savedTS: string) {
  return new Date(fetchedTS).getTime() > new Date(savedTS).getTime()
}

await ghDownloader()
