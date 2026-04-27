# Shonda Retention Roadmap — Still

## The Question Every Season Must Answer

Why does the user open the app tomorrow? Not because it saves time—tools save time. They come back because of how it makes them feel. Still isn't a productivity utility; it's a pride engine. The retention thesis is simple:

> **Every commit is a scene. The user is the hero. Still is the ghostwriter that makes them sound like the person they want to be.**

They don't come back for the algorithm. They come back for the mirror.

---

## What Keeps Users Coming Back (The Retention Loops)

### 1. The Pride Loop — "Screenshot Your Log"
Developers secretly hate the version of themselves who writes "fix stuff." Still turns that shame into a museum of intent. Users will brag about their git history. They'll screenshot their logs in PR reviews. They'll paste commit messages into Slack to prove they have taste.

- **v1:** The commit message itself is the trophy. The voice must be so consistently excellent that users feel a pang of disappointment when they have to write one manually on a machine without Still installed.
- **v1.1:** Auto-generated "commit log summary" for sprint reviews — a curated narrative of what shipped, exportable to markdown or Slack. Let them brag without trying.

### 2. The Ritual — "One Line Above Your Cursor"
The ghost-line experience is the faucet, not the pipe. Right now v1 ships the pipe (git hook). The ritual forms when the suggestion appears exactly where the user's eyes already are, ghost-like, before they even ask.

- **v1:** Hook fires on commit. It's invisible infrastructure.
- **v1.1:** Editor extensions for VS Code, IntelliJ, and Neovim. The suggestion appears in the staging UI or above the terminal. Hit Enter. Feel smarter. That's the loop.

### 3. Zero-Friction Trust — "It Just Knew"
Decision fatigue is the enemy of habit. One suggestion, zero config. But trust is fragile: one bad suggestion and the user writes their own forever.

- **v1:** Cloud-only, high-quality model. Abort on low confidence. Never guess.
- **v1.1:** Diff-hash cache warms globally. If a teammate staged the same diff yesterday, the next teammate gets the same perfect suggestion instantly. The tool feels psychic.

### 4. The Voice — "It Sounds Like Us"
Taste is a feature. In a sea of undifferentiated CLI tools, the voice *is* the product. But "us" changes depending on who's typing.

- **v1:** One voice. Master craftsman. Declarative, precise, no noise.
- **v1.1:** Team style learning (embeddings/RAG). Still observes your team's merged commits and learns your dialect—whether that's Angular commit conventions, emoji-free severity tags, or dry wit. It stops sounding like a calm senior engineer and starts sounding like *your* calm senior engineer.

### 5. The Escape Hatch — "I Still Control the Story"
Power users churn when tools feel patronizing. Zero config is courage, but total lockout is arrogance.

- **v1.1:** Introduce `.stillignore` and `.stillconfig` (minimal surface). Let power users swap models, set max diff length, or disable per-repo. Give them the steering wheel after they've learned to trust the autopilot.

---

## v1.1 Feature Roadmap — "The Next Episode"

| Priority | Feature | Retention Mechanic | Risk if Delayed |
|----------|---------|-------------------|-----------------|
| P0 | **Editor Extensions (Ghost Line)** | Ritual formation; the product finally has a face | Users think of Still as invisible plumbing; no emotional bond |
| P0 | **Rebase Workflow Excellence** | Trust with power users; real developers rebase daily | Power users uninstall if it breaks their flow |
| P1 | **Team Style Learning** | "It sounds like us" — belonging and tribal pride | Competitor copies hook; differentiation vanishes |
| P1 | **Commit Chunking Suggestions** | "Still made me a better committer" — skill transfer | Users outgrow the tool if it can't teach them structure |
| P2 | **Local Model Support** | Privacy and cost control for enterprise | Finance blocks adoption; users fear cloud data leakage |
| P2 | **Commit Log Narratives** | Pride loop export; bragging rights | Missed viral marketing opportunity |
| P3 | **Power-User Config Escape Hatch** | Retention of senior devs who drive team adoption | They fork or build their own; lose influencer advocates |

---

## What We Will NOT Do (The Anti-Roadmap)

- **No web dashboards in v1.1.** Still is invisible precision. A dashboard is visible bureaucracy.
- **No team analytics.** Measuring productivity from commit messages is surveillance, not insight. It kills trust.
- **No social features.** Developers do not need to "like" each other's commits. Pride is private.
- **No gamification.** No streaks, no badges. The commit log is the scoreboard.

---

## The Long Arc — Season 2 and Beyond

- **Enterprise Trust:** SOC-2, on-premise LLM, audit trails. Still becomes the default in regulated industries.
- **IDE Bundling:** Ship as the default commit helper inside a major editor or dev container. Become the standard, not the add-on.
- **The Still Standard:** If the commit message quality is so consistently high that open-source projects start requiring Still-generated messages in contribution guidelines, the tool becomes infrastructure.

---

*Last word from the showrunner:*

> Users don't binge because the plot is efficient. They binge because they can't stop feeling something. Make every commit feel like a sentence they wish they'd written. That's the hook. That's the retention. That's the show.
