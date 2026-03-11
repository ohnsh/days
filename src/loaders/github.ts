import type { Loader } from 'astro/loaders'
import repos from '../../.days/github/repos.json'
const commitDb = import.meta.glob('../../.days/github/commits/*.json', { eager: true })

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
