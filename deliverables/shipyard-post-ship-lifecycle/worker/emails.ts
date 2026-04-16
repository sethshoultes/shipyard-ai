/**
 * Email Template Rendering for Homeport
 * Handles template loading and variable substitution
 */

import { Project } from './kv';

export type EmailType = 'day_007' | 'day_030' | 'day_090' | 'day_180' | 'day_365';

export interface RenderedEmail {
  subject: string;
  body: string;
}

// Email templates embedded as constants
// These match the content in /templates/*.txt files

const DAY_007_TEMPLATE = `Subject: Your site is breathing on its own now

Hi {name},

Seven days. Your site shipped seven days ago, and it's been running clean.

I built {project_url} for you. I know how it works, where it's resilient, what could trip it up. The fact that it's humming along without needing me to jump in—that matters. That's the whole point.

Your site doesn't need you to hold its hand. That's pride-worthy. Seriously.

If something feels off—a page loads weird, a form isn't working, a feature you thought you had isn't there—reply to this email. I'm here for that.

Otherwise: nice work shipping something real into the world.

—

Homeport is Shipyard's way of staying close to what we build. We don't ghost you after launch.

Unsubscribe: https://homeport.shipyard.ai/unsub?token={email}`;

const DAY_030_TEMPLATE = `Subject: Does it feel like yours yet?

Hi {name},

Thirty days in. Your site is still up. The servers are responding. No surprises, which is what you want.

I've been thinking about {project_url} since we shipped it. Not obsessing—just checking in the way you'd expect someone who cares about their work to do.

Is everything working the way we planned? Are there revisions you've been meaning to make—something that looked good in the design but feels different now that real people are using it? A feature that needs tweaking? Copy that doesn't read right? That's normal. Real use teaches you things.

If you want to update something, I can help with that. If everything is genuinely perfect and you don't need anything, that's fine too.

Just reply here and let me know.

—

Homeport is Shipyard's way of staying close to what we build. We don't ghost you after launch.

Unsubscribe: https://homeport.shipyard.ai/unsub?token={email}`;

const DAY_090_TEMPLATE = `Subject: We're still here (most agencies aren't)

Hi {name},

Ninety days. Most web agencies disappear around now. They've moved on to the next project, the next client. You're old news.

I'm not like that. I'm still thinking about {project_url}.

This is the moment where things either hold up or start showing cracks. Security patches accumulate. Browser behavior changes. User expectations shift. If your site is built right, it glides through this. If it's not, ninety days reveals the problems.

How's it performing? Any issues? Any features you wish worked differently? Any security concerns that have come up? Any traffic patterns that surprised you?

This is also the sweet spot for updates. If you've been sitting on ideas—a new section, a redesign of a page, better mobile experience, faster load times—now is when returns on that investment are highest. Real data from real usage teaches you what actually matters.

If you want to talk through an update, I'm here. If everything is holding strong and you're happy, I'm glad to hear it.

Just reply and let me know.

—

Homeport is Shipyard's way of staying close to what we build. We don't ghost you after launch.

Unsubscribe: https://homeport.shipyard.ai/unsub?token={email}`;

const DAY_180_TEMPLATE = `Subject: Time for a refresh?

Hi {name},

Six months. That's the point where things get interesting.

In six months on the web, a lot moves. Security standards shift. Browsers add features. Design trends change. Your users' expectations evolve. The thing that felt cutting-edge in month one might feel basic now.

More importantly: what have you learned from real people using {project_url}? What behavior surprised you? What could work better? What would make this thing worth twice as much to your business?

This is the sweet spot for refreshes. Not because your site is broken—it's probably not. But because now you have real data. Real traffic patterns. Real feedback. That's what changes everything.

Some refreshes are big—a redesign that reflects what you've learned. Some are small—a feature that turned out to matter more than you thought, or a page that needs restructuring. Some are just updates—new browser support, faster performance, better security.

The best time to refresh is when you have something to refresh *from*. Not guesses. Not trends. Real information.

If you want to dig into this together, I'm interested. If you're happy where you are, that's legitimate too.

Let me know.

—

Homeport is Shipyard's way of staying close to what we build. We don't ghost you after launch.

Unsubscribe: https://homeport.shipyard.ai/unsub?token={email}`;

const DAY_365_TEMPLATE = `Subject: Happy Anniversary

Hi {name},

One year. {project_url} has been living in the world for a full year.

That matters. Most things don't last a year. Most web projects get orphaned or forgotten or replaced. But you kept this one running. People are using it. It's doing its job. It's part of your business now.

In one year on the web, everything changes. The browser landscape shifts. Security standards evolve. Design thinking moves forward. Your competition learned something. Your users' expectations rose. A year moves faster than you think.

Your site was built to adapt to some of that. Standards-based, clean code, forward-thinking. But it was also built in a moment in time. Twelve months is a long time in internet years.

What would a year of usage, a year of data, a year of learning teach you if you listened to it? What would you change if you could change anything? What worked better than you expected? What didn't work at all?

Sometimes the answer is "everything is still perfect and I don't need anything." That's rare, but it happens. More often, there's something worth exploring—not because something is broken, but because you know more now than you did a year ago.

If you want to build on this, refresh it, update it, or just talk through what the next chapter looks like—I'm here. You know where to find me.

Thanks for shipping something real with Shipyard. Let's see what you build next.

—

Homeport is Shipyard's way of staying close to what we build. We don't ghost you after launch.

Unsubscribe: https://homeport.shipyard.ai/unsub?token={email}`;

/**
 * Get the template for a specific email type
 */
function getTemplate(emailType: EmailType): string {
  switch (emailType) {
    case 'day_007':
      return DAY_007_TEMPLATE;
    case 'day_030':
      return DAY_030_TEMPLATE;
    case 'day_090':
      return DAY_090_TEMPLATE;
    case 'day_180':
      return DAY_180_TEMPLATE;
    case 'day_365':
      return DAY_365_TEMPLATE;
  }
}

/**
 * Render an email template with project data
 */
export function renderEmail(emailType: EmailType, project: Project): RenderedEmail {
  const template = getTemplate(emailType);

  // Replace template variables
  const rendered = template
    .replace(/{name}/g, project.customer_name)
    .replace(/{project_url}/g, project.project_url)
    .replace(/{email}/g, encodeURIComponent(project.customer_email));

  // Split subject and body
  const lines = rendered.split('\n');
  const subjectLine = lines[0].replace('Subject: ', '');
  const body = lines.slice(2).join('\n'); // Skip subject and blank line

  return {
    subject: subjectLine,
    body: body,
  };
}

/**
 * Get the number of days for each email type
 */
export function getEmailDays(emailType: EmailType): number {
  switch (emailType) {
    case 'day_007':
      return 7;
    case 'day_030':
      return 30;
    case 'day_090':
      return 90;
    case 'day_180':
      return 180;
    case 'day_365':
      return 365;
  }
}
