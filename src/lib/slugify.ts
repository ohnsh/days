import slugify from '@sindresorhus/slugify'

export const customReplacements = [
  ['🏃‍♂️', ' run '],
  ['🎙️', ' stream '],
  ['⏳', ' timelapse '],
  ['🏛️', ' course-xpro '],
] as readonly [string, string][]

const _slugify: typeof slugify = (string: string, opts?) => slugify(string, { ...opts, customReplacements })

export default _slugify