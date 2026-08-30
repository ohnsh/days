// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import flexoki from 'starlight-theme-flexoki'
import { sidebarTemplate } from './src/lib/const'
import { satteri } from '@astrojs/markdown-satteri'
import { externalLinks } from '@/hast/external-links'
import alpinejs from '@astrojs/alpinejs'

// https://astro.build/config
export default defineConfig({
  site: 'https://days.ohn.sh',
  integrations: [
    starlight({
      plugins: [flexoki({ accentColor: 'yellow' })],
      title: 'days.',
      description:
        'A blog experiment emphasizing aggregation. Content from various sources (GitHub, YouTube, regular posts, etc.) is merged into a day-oriented feed and archive that the author can curate and customize.',
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
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', type: 'image/png' },
        },
      ],
      // favicon value always rendered after custom tags, so it needs to be the preferred icon.
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/ohnsh/days' },
        { icon: 'youtube', label: 'YouTube', href: 'https://youtube.com/@ohn-sh' },
        { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/j.ohn.sh' },
      ],
      sidebar: sidebarTemplate,
    }),
    alpinejs(),
  ],
  markdown: { processor: satteri({ hastPlugins: [externalLinks] }) },
  // vite plugin wuz here. it packaged css from 'lite-youtube' into a css layer. it should
  // be irrelevant now that I have LiteYTVideo.astro wrapping the library component.
  compressHTML: false,
})
