---
title: First pass at an interactive picture-in-picture video component
date: 2026-08-20
---

<video src="/crop-demo.mp4" playsinline controls style="max-height: 500px;">
</video>

Much of the video that winds up on [dash.ohn.sh](https://dash.ohn.sh) is recorded in a very particular format (in [OBS Studio](https://obsproject.com/)), consisting of four 1080p tiles, each representing an "angle" of the same scene. Two of those angles are screen captures, which are difficult to read when limited to one quarter of a video player. Luckily, the web platform provides a bunch of tools to process video and create custom video players. The above demo shows a first pass at a solution, implemented as an interactive React component.

### Concept

The basic idea is to display one quadrant at a time in a main view that occupies most of the video player, with the other three quadrants shown picture-in-picture style along one edge. Clicking a picture-in-picture view swaps it with the main view. Clicking the main view toggles all of the picture-in-picture views on/off as a group, which is important because they do obscure part of the main view when enabled.

### Implementation

All four views use the same `CropCanvas` component, implemented using the `<canvas>` element. Each view registers a callback on the underlying `<video>` that draws a specific rectangle from the video frame onto its canvas. Here's the full effect:

```
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cbHandle: number

    const draw = () => {
      ctx.drawImage(
        video,
        ...source.rect,
        ...[0, 0, canvas.width, canvas.height],
      )
    }

    const cb: VideoFrameRequestCallback = (_now, _metadata) => {
      draw()
      cbHandle = video.requestVideoFrameCallback(cb)
    }

    // provide immediate feedback when pipEnabled changes
    draw()
    cbHandle = video.requestVideoFrameCallback(cb)

    return () => {
      video.cancelVideoFrameCallback(cbHandle)
    }
  }, [videoRef, source])
```

Since the canvases are interactive (the layout changes when you click them), they're wrapped in `<button>` elements that handle click events, making the overlay relatively accessible, especially to keyboard users. Additionally, the static data structure that defines the quadrants includes descriptive labels for screen readers:

```
{
  id: 'topLeft',
  name: 'Display 1 (top left)',
  rect: [0, 0, 1920, 1080],
},
```

Currently, the 'Crop' button is displayed whenever the source video resolution is 4K (four 1080p tiles equals 4K widescreen). When the overlay isn't activated, the component isn't rendered at all, so there are no canvases or frame-painting loops consuming resources until explicitly requested.
