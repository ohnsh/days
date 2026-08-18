---
title: Filtering video content by voice activity, powered by Silero VAD
date: 2026-08-18
---

For a new project, I have a video processing pipeline that prepares raw camera footage for publishing, extracts metadata, and syncs everything to a Cloudflare R2 bucket. The most recent addition is voice activity detection with [Silero VAD](https://github.com/snakers4/silero-vad), which I'm running on the CPU via [onnxruntime-node](https://github.com/microsoft/onnxruntime). The video below shows it processing several hours of footage in roughly 20 seconds.

<figure>
<video src="/video-sh-demo.mp4" playsinline muted autoplay loop />
<figcaption>Silero VAD analyzing several hours of footage in 20 seconds. Running on the CPU via onnxruntime-node</figcaption>
</figure>
