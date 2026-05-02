# Steve's Positions — Deploy Verification

## Product Naming

**Proof.** One word. Final. When you ask "is my site actually live?" the answer isn't a dashboard checkbox — it's Proof. Dashboards lie. DNS lies. Green checkmarks lie. Proof doesn't.

A name with two words is a committee. A name with three words is a startup that will pivot in six months. Proof is what you present when someone doubts you. It is the evidence that your work actually reached the world.

Other tools "verify." Proof *proves*. That distinction is the difference between a bureaucrat stamping a form and a witness swearing on the stand.

## Design Philosophy

This is a smoke detector, not a fire extinguisher. It doesn't fix the fire — it screams before you smell smoke. The interface should feel like a single red thread pulled tight between your deploy and your customer's browser. Any slack in that thread, any gap, and the thread turns red. Instantly.

No graphs. No toggles. No "health scores." Just: alive or dead. We are not building a hospital monitor with 40 waveforms. We are building the one alarm that drags you out of bed before the house burns down.

## User Experience (First 30 Seconds)

You open Proof after a deploy. The screen is black. A single line pulses: `shipyard.company — breathing`. That's it. No sidebar. No "last checked 3 minutes ago" fine print. Just a pulse.

If it stops breathing, the screen turns blood-red and a bell rings — not an email, not a Slack ping, a **bell**. The first 30 seconds should feel like you've plugged a stethoscope directly into the internet and heard a heartbeat. You should feel relief, then forget it exists, then feel terror when it breaks the silence.

## Brand Voice

Proof speaks like a Coast Guard radio operator. No "Oops! Something went wrong." No emojis. No "We're sorry for the inconvenience." It says: **"DEPLOYMENT NOT_FOUND. Customer sees 404. You shipped nothing."**

Then it goes silent until it matters again. It does not apologize for waking you at 3 AM. The building is on fire. You should be awake.

## What to Say NO To

NO dashboards with 47 metrics. NO "trend analysis." NO "anomaly detection" that learns your failure patterns. NO configurability. You don't get to decide which routes matter — we check the ones customers actually hit.

NO "optional" toggle. Proof is not a feature you enable. It's the floor the product stands on. Remove everything that isn't the truth. If it doesn't answer "did my deploy actually reach my customer?" it doesn't belong in the product.

Simplicity is not the absence of clutter. It is the presence of exactly what matters, and nothing else. If a designer shows you a mock with a "settings" gear icon, fire them.

## The Emotional Hook

People will love Proof because it protects their dignity. The worst feeling in software isn't a bug — it's standing in front of someone, sharing a link you *know* you deployed, and watching it 404 in their hands. That humiliation is what Proof prevents.

Proof is the friend who grabs your shoulder before you walk on stage and says: "Your fly is down." Nobody wants a smoke detector until the night they almost die in their sleep. Then they worship it. We are selling peace of mind disguised as a heartbeat monitor. Once someone feels that pulse, they will never ship without it again.
