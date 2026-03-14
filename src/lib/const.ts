import type { StarlightUserConfig } from '@astrojs/starlight/types'

export type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>

export const sidebarTemplate: SidebarConfig = [
  // header area
  {
    label: 'John Sherrell',
    link: 'https://j.ohn.sh',
    attrs: { target: '_blank', class: 'author' },
  },
  // main area
  { label: '<slot />', link: 'https://slot' },
  // footer area
  {
    label: 'scratch.ohn.sh',
    link: 'https://scratch.ohn.sh',
    attrs: { target: '_blank', style: 'margin-top: 2em' },
  },
  { label: 'j.ohn.sh', link: 'https://j.ohn.sh', attrs: { target: '_blank' } },
]