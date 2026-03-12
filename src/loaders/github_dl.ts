import * as Bun from 'bun'
import { mkdir } from 'node:fs/promises'

async function api(url: URL | string) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
  }

  const resp = await fetch(url, { headers })
  const json = await resp.json()
  if (!resp.ok) {
    throw new Error(json.message)
  }
  return json
}

async function ghDownloader() {
  const reposUrl = 'https://api.github.com/user/repos'
  const repos = await api(reposUrl)

  repos.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))

  await mkdir('.days/github/commits', { recursive: true })
  await Bun.file('.days/github/repos.json').write(JSON.stringify(repos))

  for (const repo of repos) {
    const { name, commits_url } = repo
    const url = new URL(commits_url.replaceAll(/{[^}]+}/g, '')) /* ?author=ohnsh */
    url.searchParams.set('per_page', '100')
    const commits = await api(url).then((commits) =>
      commits.filter(({ commit }) => isMyCommit(commit))
    )

    await Bun.file(`.days/github/commits/${name}.json`).write(JSON.stringify(commits))
  }
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

await ghDownloader()