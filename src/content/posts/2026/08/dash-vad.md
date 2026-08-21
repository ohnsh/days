---
title: dash.ohn.sh — Automated content filtering powered by Silero VAD
date: 2026-08-18
---

<video src="/video-sh-demo.mp4" playsinline muted autoplay loop>
</video>

For a new project, I have a video processing pipeline that prepares raw camera footage for publishing, extracts metadata, and syncs everything to a Cloudflare R2 bucket. The newest feature is voice activity detection with [Silero VAD](https://github.com/snakers4/silero-vad), which I'm running on the CPU via [onnxruntime-node](https://github.com/microsoft/onnxruntime). Here it is taking around 20 seconds to analyze several hours of footage on my Mac Mini.

The model takes a tensor representing 512 samples of 16-kHz, single-channel audio (roughly 30 ms) and returns a score indicating the probability that the window contains speech ("voice activity"). In the pipeline, audio is extracted from source recordings and normalized with ffmpeg, then fed through the model piece by piece. The raw scores are filtered through a state machine (during a speech segment, a given sample is more likely to register as speech) to produce a list of timestamps representing segments of the video that contain speech.

It's great that inference runs so fast on the CPU because it simplifies deployment. The pipeline will run frequently on both Apple Silicon and an Intel-based Linux server. In the latter case, I still need to dockerize the TypeScript portion of the pipeline because the server runs Alpine/musl libc but onnxruntime-node is linked against glibc.

The project is definitely a work-in-progress, but it's live at [dash.ohn.sh](https://dash.ohn.sh). When I started a couple of weeks ago, I had in mind a smart-home dashboard of sorts, but so far, only the camera feeds are implemented.
