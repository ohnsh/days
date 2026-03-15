// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import flexoki from 'starlight-theme-flexoki'
import rehypeExternalLinks from 'rehype-external-links'
import { sidebarTemplate } from './src/lib/const'

// https://astro.build/config
export default defineConfig({
  site: 'https://days.ohn.sh',
  integrations: [
    starlight({
      // pagefind: false,
      plugins: [flexoki({ accentColor: 'yellow' })],
      title: 'days.',
      description:
        'A blog experiment emphasizing automation. The idea is to bring in content from various sources (GitHub, YouTube, etc.) and allow the author to curate and customize the presentation.',
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
  ],
  markdown: { rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: [] }]] },
  // mdx({ rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: [] }]] }),
  vite: {
    plugins: [
      {
        // Copilot pulled this one out. Works great.
        // Now I can override <YouTube> component styles without any fuss.
        // TODO: Delete once all instances are encapsulated by my <LiteYTVideo> scoped CSS.
        name: 'wrap-it-up',
        enforce: 'pre',
        transform(code, id) {
          if (id.endsWith('lite-youtube-embed/src/lite-yt-embed.css')) {
            return { code: `@layer thirdparty {\n${code}\n}`, map: null }
          }
        },
      },
    ],
  },
})
