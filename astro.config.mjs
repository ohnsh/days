// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import flexoki from 'starlight-theme-flexoki'
import mdx from '@astrojs/mdx'
import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      // pagefind: false,
      plugins: [flexoki()],
      title: 'days.',
      description:
        'A blog experiment that will emphasize automation. The idea is to bring in content from various sources (GitHub, YouTube, etc.) and allow the author to curate and customize the presentation.',
      lastUpdated: false,
      routeMiddleware: '@/routeData.ts',
      logo: {
        replacesTitle: false,
        dark: '@/assets/days-dark.svg',
        light: '@/assets/days-light.svg',
      },
      customCss: ['@/styles/global.css'],
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
    // mdx({ rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: [] }]] }),
  ],
  markdown: { rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: [] }]] },
})
