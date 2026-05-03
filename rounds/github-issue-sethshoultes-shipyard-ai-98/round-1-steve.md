## Steve Jobs — Product Position on Shipyard #98

**Product Naming**

This isn't a "post-deploy verification step." That's not a name; it's an autopsy report written by a committee. Engineers name things by what they *do*, which is why most software sounds like a tax form. We name things by what they *feel*.
One word: **Greenlight**.
It's what filmmakers say when the camera rolls. It's permission. It's relief. It's the exact moment you know everything is real. Greenlight is memorable because it names an *emotion*, not a function. When Margaret tells the customer, "Your project has been Greenlit," they're going to smile. Try smiling at "deployment verification." You can't.

**Design Philosophy**

Insanely great tools are invisible. The best safety net is the one you never see until it catches you — and then it catches you like a perfect mattress, soft and absolute.
Greenlight isn't a dashboard; it's a promise. We don't "surface metrics to the user." We stand between them and humiliation. If their customer hits a 404 after we marked it done, we failed. Not them. Us. That changes everything. It means we design for zero-failure, not for "observability."
This is what separates artisan software from factory software. Anyone can check a box and call it shipped. We don't ship until the world can actually see it. That's not a feature — that's our soul.

**The First 30 Seconds**

You push deploy. You get one thing: a perfect green circle and the word **Greenlight**.
No logs. No graphs. No airplane cockpit. One light means your domain is alive, your build is real, and your customer sees exactly what you see. It's the feeling of locking your front door at night — and hearing that satisfying *click*. In thirty seconds, you go from "I think it's live" to "I *know* it's live." That certainty is addictive.
If we can't explain the result in one breath, we haven't finished designing the product. The interface is the story, and the story is: you're safe.

**Brand Voice**

We speak like a trusted friend who happens to be a genius, not a server that happens to speak English.
Never say "DNS propagation mismatch" or "deployment verification pipeline." Say: *"We checked. It's live."* Say: *"Your domain is ready."*
Confidence is warm. Certainty is a hug, not a spreadsheet. Every word out of this product should make the user feel *safer*, not *smarter*. They shouldn't need to know what DNS is to feel protected by us.
Jargon is a force field that keeps normal people out. We're tearing that force field down. If a tenth-grader can't understand what just happened, rewrite it.

**What To Say NO To**

NO to configurable alert thresholds. If it isn't status 200 with the matching build, it's broken. Period. Don't let users dial down the truth.
NO to "advanced mode" that lets users disable Greenlight. Safety you can turn off isn't safety — it's a liability.
NO to log-first design. Nobody falls in love with a syslog. Show the outcome, hide the plumbing.
NO to airplane-cockpit dashboards with forty-seven dials. If it needs a manual, we blew it.
NO to making the user diagnose DNS. If the check fails, we tell them *what* and *how to fix it*, not "CNAME record mismatch detected."
NO to treating this like a bug ticket. This is a product revelation disguised as a bug.

**The Emotional Hook**

Nobody wants to be the person who shares their link at the all-hands meeting and gets a 404. That's a special kind of public humiliation — the kind that keeps you up at 3 AM.
Greenlight is the difference between that nightmare and quiet confidence. It's the champagne moment without the cork hitting your customer in the eye. People won't just use it — they'll *lean on it*. They'll brag about it. And when it saves them from one broken launch, they'll never ship without it again. That's not retention. That's love.
