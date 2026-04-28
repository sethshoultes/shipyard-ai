# Shonda Retention Roadmap — Changelog Theatre v1.1

## What Keeps Users Coming Back

People do not return for a video. They return for a feeling. The current product leaves them at a job ID. A job ID is not a cliffhanger; it is a cancellation notice.

Here is what actually drives retention in a narrative product:

1. **The Emotional Payoff Loop**
   - The line *"That was you. That mattered."* is the strongest asset in the script. Users must hear it. Then they must want to hear it again next week.
   - Every repo has drama: the merge that almost broke main, the 3 AM fix, the feature that shipped after weeks of doubt. The AI must learn to name that drama, not just list commits.

2. **Habit Formation Through Anticipation**
   - A 6–12 minute render time is not a bug if you treat it as a narrative beat. Release a "Coming Soon" teaser trailer while they wait. Show a behind-the-scenes writer's room. Make the wait part of the show.
   - Weekly email: *"Your repo this week: 4 commits, 1 showdown. Curtain rises Friday."* Now they have an appointment.

3. **Personal Archive & Rewatch Value**
   - Users need a private "My Theatre" gallery of every video ever made for their repos.
   - Season finale compilations: auto-generated "Best of Q3" montages that summarize a quarter of work.
   - Rewatch is retention. No one rewatches a queue message.

4. **Social Currency**
   - One-click share to Twitter/X/LinkedIn with an embeddable player.
   - Public gallery of "Featured Shows" curated by the community.
   - Teams must be able to co-star. A shared repo video should credit every contributor like a cast list. That creates peer pressure to return.

5. **Subscription as Story Access**
   - Free tier: 3 renders/day, watermarked, standard template.
   - Paid tier: unlimited renders, HD export, custom themes (Sci-Fi, Noir, Rom-Com), team cast lists, and early access to new "seasons" (templates).
   - The paid tier is not "more API calls." It is *director's cut.*

---

## v1.1 Feature Roadmap

### Act I: Fix the Broken Story (v1.1.0 — Foundation)
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Renderer Delivery** | End-to-end pipeline: queue → Remotion → FFmpeg → MP4 → CDN link. | Users finally get the product they were promised. |
| **Web Playback** | Dedicated video page with persistent URL. Users can replay, not just download. | Creates a destination. |
| **Progress Theatre** | Real-time status page during render: "Writer's room drafting..." → "Director calling action..." → "Final cut locking..." | Transforms wait time from abandonment risk to engagement. |
| **Email Confirmations** | "Your show is ready" email with thumbnail, share buttons, and "Book next week" CTA. | Closes the loop and schedules the return visit. |

### Act II: Build the Habit (v1.1.5 — Retention Layer)
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Weekly Digest Prompt** | *"Your repo had 12 commits this week. Generate your Friday episode?"* | Turns sporadic usage into a weekly ritual. |
| **My Theatre Archive** | Personal dashboard of all rendered videos, sortable by repo, date, and mood. | Archive value increases with time; harder to churn. |
| **Multi-Genre Scripts** | Beyond Sorkin: Noir, Rom-Com, Heist, Nature Documentary. Users pick the tone. | Replayability and variety; users try every genre. |
| **Team Cast Lists** | Shared repo videos automatically credit all GitHub contributors. | Peer network effects; team members return to see their billing. |

### Act III: The Flywheel (v1.2.0 — Growth Engine)
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Embeddable Player** | `<iframe>` widget for blogs, GitHub READMEs, and portfolio sites. | Social proof drives organic acquisition; creators return to manage embeds. |
| **Public Gallery / Trending** | Community feed of top videos, searchable by language, framework, or mood. | Content discovery loop; users return to see what others made. |
| **Season Finales** | Auto-generated quarterly compilations with highlight reels and stats. | Emotional summation of work; shareable milestone content. |
| **Director's Cut Subscription** | Paid tier: HD, no watermark, custom themes, private shows, priority render queue. | Monetization + exclusivity = higher perceived value. |

---

## The One Rule

> *"If the user does not feel something by minute two, they will not be back for season two."*

v1.1 is not a feature list. It is a narrative rescue mission. Ship the feeling first. The API is just the stagehand. The renderer is the spotlight. But the script—the emotional truth of the work—that is what sells tickets.
