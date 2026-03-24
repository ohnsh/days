---
title: Firebase Quotas and Cloudflare Workers
date: 2026-03-20
tags: [course-xpro]
---

I'm currently enrolled in the MIT xPRO Professional Certificate in Coding program. In a recent assignment, we "delved" (as the course materials would put it) into GitHub Actions by setting up an automated testing and deployment workflow for a simple Express.js app. See [the README](https://github.com/ohnsh/ra24-3-cloudflare) on GitHub for my full report.

The deployment component was supposed to happen on Firebase, but I had already reached my project quota due to an earlier batch of assignments. After digging, I found information suggesting that my quota would reset 30 days after deleting the old projects, but the actual error message just said to contact support to request an increase. I received a prompt response (but to my Gmail account, of course, so I didn't see it for a few days):

> To help us ensure that the resources you need will be available to you and that this is a legitimate request, please do one of the following:
>
>    - Make a payment of $10 USD [...] and reply to this message when the charge clears.
>      Your payment can be applied to any charges you incur in the future and will be visible as a credit in your account.
>    - Reply to this message with the billing account of another project that you own that has cleared a charge of at least the amount mentioned.

Okay, Google, I'll use something else.

I've been using Cloudflare for several things, including this blog project, so naturally I chose Cloudflare Workers. (I've never given Cloudflare a dime, but only because they're shy about asking.) Everything went pretty smoothly from there. Once again, [a link to the README for my full report](https://github.com/ohnsh/ra24-3-cloudflare).
