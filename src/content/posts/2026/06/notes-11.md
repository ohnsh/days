---
title: Notes
date: 2026-06-11
---

When querying the `uploads` playlist using the YouTube API `playlistItems` endpoint, livestream "DVR" recordings are returned along with, and are indistinguishable from, normal video uploads. Apparently, they can be identified using secondary API calls.[^exclude-livestream]

[^exclude-livestream]: https://www.joshvickerson.com/posts/excluding-livestreams-from-the-youtube-data-api-in-javascript/
