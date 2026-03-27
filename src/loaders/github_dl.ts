import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'

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

async function ghDownloader() {
  // ?sort=updated ?sort=pushed
  // ?since=timestamp only show repositories updated after the given time
  // 304 Not modified (?)
  await mkdir('.days/github/commits', { recursive: true })

  const reposFetched = await apiAllPages('https://api.github.com/user/repos?sort=pushed')
  const reposSaved = await Bun.file('.days/github/repos.json')
    .json()
    .catch((e) => [])

  for (const repo of reposFetched) {
    const { full_name, pushed_at } = repo
    const saved = reposSaved.find((repo) => repo.full_name === full_name)

    if (saved && !isUpdated(pushed_at, saved.pushed_at)) {
      // console.log(`${repo.name} not updated; skipping.`)
      continue
    }

    const { name, commits_url } = repo
    // https://docs.github.com/en/rest/commits/commits
    const url = new URL(commits_url.replaceAll(/{[^}]+}/g, '')) /* ?author=ohnsh */
    let commits
    if (!saved) {
      console.log(`${name} not saved; fetching all.`)
      url.searchParams.set('per_page', '50')
      commits = await apiAllPages(url).then((commits) =>
        commits.filter((commit) => isMyCommit(commit))
      )
    } else {
      const savedCommits = await Bun.file(`.days/github/commits/${name}.json`).json()
      const [latestCommit] = savedCommits
      const { sha } = latestCommit
      const { date } = latestCommit.commit.author

      url.searchParams.set('per_page', '10')
      url.searchParams.set('since', date)

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

function isMyCommit(commit) {
  const { name, email } = commit.commit.author
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
