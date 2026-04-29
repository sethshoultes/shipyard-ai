# Round 2 — Steve

Elon, your first-principles engineering is usually right. But in Round 1, you're optimizing for *PR merge velocity* instead of *customer certainty*. You're solving for the engineer's convenience, not the human at the other end of the deploy. When you optimize for what's easy to build instead of what's true, you ship tools that lie. And lying tools are worse than no tools.

**Where you're optimizing for the wrong metric**

Cutting Build-ID matching because it "touches build tools" is optimizing for JIRA ticket closure over truth. Status 200 means "a server is awake," not "your code shipped." A ghost page from Tuesday passing as today's deploy is worse than no check at all — it's a false certificate of health.

We will verify the build ID. Not by parsing HTML bodies across Vite, Next, and eleven other frameworks. That is indeed a quagmire, and you were right to flag it. We will inject the build ID as a response header at the edge — one line in `wrangler.toml`. No monorepo surgery. No build-tool dependencies. No scope creep. But absolutely non-negotiable.

Without it, we're just checking that Cloudflare's lights are on.

Querying the Cloudflare API instead of curling the live domain is optimizing for *runner DNS hygiene* over *customer reality*. The customer doesn't visit the Cloudflare API. They visit `shipyard.com`. They resolve it via their ISP, their coffee shop Wi-Fi, their mobile carrier.

If DNS is poisoned on our runner but clean for the world, that is irrelevant — we care about the reverse. We curl the actual custom domain from the actual public internet. The only truth is what the real world sees, not what Cloudflare's internal status endpoint reports. A green check in Cloudflare's dashboard that the customer can't load is meaningless.

Checking `/` only is optimizing for code simplicity over user reality. Users don't live at `/`. If `/about` or `/pricing` is still serving Tuesday's build while `/` is fresh, the product is broken and the deploy was a failure. We check a small set of key routes. Not every route. Not one route. The routes that actually matter to the business and to the customer's journey.

Anything less is a developer convincing themselves that less work equals good product. It doesn't.

**Concessions — where you're right**

Baking this into the shared deploy template with zero opt-in is correct. Optional verification is fiction, and you called it with precision. If Margaret can skip it, she will skip it, and a customer will pay the price.

You're also right that serial curls are a scaling disaster — fifty domains times three retries at five seconds each is an eternity in CI. We probe domains in parallel with a strict global timeout.

And you're right that body parsing is a quagmire; a response header is the pragmatic, elegant path. I concede the mechanism. I do not concede the requirement.

**Why design quality matters here**

You call this "infrastructure, not user-facing." Wrong. The deploy engineer is the user.

At 2 AM, staring at a terminal after a risky push, a wall of curl output creates anxiety. A sentence — *"shipyard.company is live with build 4a7f9e"* — creates certainty.

Tools that create anxiety get bypassed, scripted around, or silently ignored.

Tools that create swagger get used. We are building the latter.

The emotional moment after deploy is the product. If we don't design for that moment, we don't have a product. We have a script that people will find ways to avoid.

And an avoided tool is just technical debt wearing a badge.

**Top 3 non-negotiable decisions**

1. **The product is Proof, and it speaks in human results.**
   "Yes" or "No." Not logs. Not dashboards. Not JSON arrays. Not exit codes hidden in GitHub Actions. A sentence that a human can read at 2 AM without parsing, without scrolling, without doubt. If the output requires a manual, the product has already failed.

2. **We verify the live customer domain via real HTTP from the real internet.**
   Cloudflare's internal API status is not the customer's experience. The custom domain, resolved via public DNS and curled from CI, is the only valid test. We do not accept proxy status as proof.

3. **We verify the build ID on every check.**
   Status 200 without build ID is theater. One edge-injected header. No exceptions. No "v2." No discussion. If we cannot prove the right build is live, we do not declare success. Period. A green light that lies is worse than a red light that tells the truth.
