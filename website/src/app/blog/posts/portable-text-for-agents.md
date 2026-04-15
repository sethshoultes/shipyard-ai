---
title: "Portable Text Changes Everything for AI Agents"
description: "WordPress stores HTML blobs. EmDash stores structured JSON. This is why AI agents can build sites 10x faster."
date: "2026-04-04"
tags: ["portable-text", "structured-content", "ai", "emdash"]
---

If you've worked with content platforms as an engineer, you know the pain. Your CMS stores posts as HTML strings. You need to pull out the second paragraph? Parse HTML. Add a code block? Concatenate strings. Extract metadata? Regex hell. WordPress was designed for humans editing in TinyMCE, not for machines reading and writing programmatically.

Portable Text flips this. Instead of HTML, your content is structured JSON. A blog post isn't a string with `<p>` tags—it's an array of block objects: `{_type: "paragraph", children: [{text: "..."}]}, {_type: "codeBlock", code: "...", language: "ts"}`. Every block has a known schema. Every field is typed. This is what AI agents have been waiting for.

Here's what changes in practice.

With WordPress, when you want an AI to write a new post, you tell it to output HTML. It hallucinates `<div>` tags, forgets to close `<span>`, includes invalid nesting. Then a human has to fix it. With Portable Text, you give the AI your schema as JSON and ask it to generate blocks. There's no room for invalid markup—the schema enforces it. If the AI tries to include an unsupported field, it simply fails validation. You can retry, or route to a human. No surprise broken content.

This extends everywhere. Want to insert a callout block in the middle of a blog post? With HTML, you're doing string surgery—find the paragraph, split it, insert markup, pray it parses. With Portable Text, you're working with an array. Insert is one line of code. Want to extract all "tip" blocks for a summary? Filter the array. Want to convert old WordPress posts to EmDash? Parse the HTML, map each `<p>` to a paragraph block, map each `<code>` to a code block. Clean transformation.

For our AI pipeline, Portable Text is the game-changer. Our agents (let's call them the content generation team) work like this:

First, they read your site's schema—what content types exist, what blocks are allowed, what custom fields you've defined. The schema is JSON Schema, so it's trivially machine-readable.

Second, they generate content blocks. "Write a homepage hero paragraph" becomes: generate a Portable Text block of type "hero" with fields `title` and `subtitle`. The output is JSON. No interpretation needed.

Third, they validate and deploy. Because Portable Text is structured, validation is automatic. We can check types, required fields, block count limits, all without manually parsing strings.

This is why our build time dropped 10x. When everything is structured, agents can work in parallel on different content blocks, validate as they go, and ship without human review. The last time we built a site on WordPress, three team members spent two days just cleaning up HTML formatting from the copy team. With EmDash and Portable Text, that step doesn't exist.

The kicker: Portable Text isn't EmDash-specific. It's an open standard by Sanity. But EmDash ships it as the native content format, which means it's first-class—not bolted on, not a third-party integration. The entire platform is designed around structured content. That matters.

If you're running a traditional CMS and wondering why your AI tooling feels clunky, this is why. Your content isn't structured. It's markup. And markup isn't what machines want to read.
