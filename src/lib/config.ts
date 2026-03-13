import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { StarlightPageProps } from '@astrojs/starlight/props'

type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>
// type SidebarConfig = NonNullable<StarlightPageProps['sidebar']>

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

export function applySidebarTemplate(sidebar: SidebarConfig) {
  return sidebarTemplate.flatMap((item) => {
    if (typeof item !== 'object' || !('label' in item)) {
      return item
    }
    return item.label === '<slot />' ? sidebar : item
  })
}
