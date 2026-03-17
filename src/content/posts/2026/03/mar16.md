---
title: j.ohn.sh Back in Business
date: 2026-03-16
---

My link page at https://j.ohn.sh had been neglected for a few years, so I decided to rebuild it on Astro, the same framework I'm using here at days.ohn.sh. The [old repository](https://github.com/ohnsh/ohnsh.github.io) is still on GitHub.

Back when I made the original, I wouldn't have been caught dead using a framework. In other, more complicated projects, I built static HTML using Makefiles and [`esh` templates](https://github.com/jirutka/esh), but this one was a simple index.html with no build tool.

Times have changed. For starters, I now view software development as a career rather than a hobby, and frameworks are essential in modern web development. The tools have come a long way, too. Just a few years ago, it was perfectly rational to try pretty hard to avoid NPM, Webpack, Babel, et. al. But modern tools like Vite (used by Astro), Next.js, Bun, and Parcel are incredibly good.

## Rediscovering SVG sprites.

Looking through my old code was a good reminder that even for a dead-simple link page, authoring the full HTML in vim can get unwieldy. In particular, SVG icons can easily double the size of your HTML. For background, there are two basic ways to embed an SVG image in a webpage. One is to simply reference an .svg file in an `<img>` element, like any other image file. The other is to embed the full `<svg>` document within the HTML.

Unfortunately, while the `<img>` element is nice and concise, many of the benefits of SVGs are only available when you have the full `<svg>` document embedded. In Astro, you literally do this:

```astro
---
import Icon from 'icon.svg'
---

<a class="social-link">
  <Icon stroke-width="1" {...otherSvgAttributes} />
</a>
```

Now, the full `<svg>` document in icon.svg is embedded wherever you use `<Icon />`. Of course, that's all made possible by build tooling--it won't work in plain HTML. What *will* work, however, is to embed a small, stub `<svg>` document that references symbols and shapes defined in external .svg files with `<use>`. The referenced fragments (often called "sprites") are deeply cloned and rendered in place of the `<use>` element:

```html
<!-- The `xmlns` attribute of `<svg>` is required in .svg files (which are XML)
     but optional when embedded in HTML. -->
<svg class="icon">
  <use href="/img/feather-sprite.svg#github" />
</svg>
```

Now, this isn't quite the same as embedding the full SVG document, because the cloned elements can't be directly targeted by CSS in the embedding (HTML) document. They do, however, *inherit* styles set on the parent `<svg>` (or the host `<use>`) element. That essentially means you can apply any style you want to them, including conditionally with media queries, as long as it isn't specifically overridden by attributes or CSS internal to the SVG.