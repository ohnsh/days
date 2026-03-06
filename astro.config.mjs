// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'days.',
      lastUpdated: true,
      routeMiddleware: '@/routeData.ts',
      logo: {
        replacesTitle: false,
        dark: '@/assets/days-dark.svg',
        light: '@/assets/days-light.svg',
      },
      customCss: ['@/global.css'],
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.png', type: 'image/png' } },
      ],
      // favicon value always rendered after custom tags, so it needs to be the preferred icon.
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/ohnsh/days' },
        { icon: 'youtube', label: 'YouTube', href: 'https://youtube.com/@ohn-sh' },
        { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/j.ohn.sh' },
      ],
      sidebar: [
        {
          label: 'John Sherrell',
          link: 'https://j.ohn.sh',
          attrs: { target: '_blank', class: 'author' },
        },
        { label: 'March', autogenerate: { directory: '2026/mar' } },
        { label: 'February', autogenerate: { directory: '2026/feb' }, collapsed: true },
        { label: 'January', autogenerate: { directory: '2026/jan' }, collapsed: true },
        {
          label: 'scratch.ohn.sh',
          link: 'https://scratch.ohn.sh',
          attrs: { target: '_blank', style: 'margin-top: 2em' },
        },
        { label: 'j.ohn.sh', link: 'https://j.ohn.sh', attrs: { target: '_blank' } },
      ],
    }),
  ],
})
