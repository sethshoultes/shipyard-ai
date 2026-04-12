# EventDash Demo Script

**Runtime:** 2 minutes
**Tone:** Human, urgent, real

---

## COLD OPEN — THE PROBLEM (0:00–0:30)

[SCREEN: A yoga studio website. Clean, serene. The "Events" page shows... nothing.]

NARRATOR: It's Tuesday night. Sarah runs Sunrise Yoga—thirty students, two instructors, one website she paid too much for.

[SCREEN: Quick cut to an email inbox. Subject lines: "Is the workshop still happening?" "Where do I sign up?" "Hello???"]

NARRATOR: She's got a breathwork workshop in five days. Forty people want to come. And right now, her events page is showing them... *this*.

[SCREEN: Back to the empty Events page. A single line: "No events yet."]

NARRATOR: Not because she didn't try. She tried. She clicked "Create Event" last week and got—

[SCREEN: Browser console. Red text: "Failed to load admin page."]

NARRATOR: —that. The plugin was broken. Has been for months. Nobody told her. She's been emailing her event list to people like it's 2004.

---

## THE FIX — WHAT WE DID (0:30–0:45)

[SCREEN: Split view. OLD code on left, NEW code on right. Highlight the key change.]

NARRATOR: Here's what was wrong. The form was looking for something called `input.action`. But the system sends `input.actions`—with an 's'. Arrays, not strings. Classic.

[SCREEN: The fix zooms in. Clean, simple.]

NARRATOR: Three lines. That's it. We fixed the listener, cleaned up the form—five fields down to three—and got out of the way.

---

## THE WALKTHROUGH — SEEING IT WORK (0:45–1:30)

[SCREEN: The admin dashboard. Clean. A sidebar shows "EventDash."]

NARRATOR: So let's do what Sarah couldn't do last week.

[SCREEN: Click "Create" button. A form appears: Name, Date, Description. Three fields. That's all.]

NARRATOR: Name. Date. Description. No venue capacity. No recurring schedules. No "what's your event category?" dropdown with thirty-seven options nobody needs.

[SCREEN: Type "Saturday Breathwork" in Name. "2026-04-19" in Date. "90 minutes. Bring a mat." in Description.]

NARRATOR: We type what matters.

[SCREEN: Click "Create."]

NARRATOR: We click Create.

[SCREEN: A toast appears—subtle, green. One word: "Created." Then the page navigates to the Events list.]

NARRATOR: And we're done. No loading spinner. No confirmation modal asking if we're *really* sure. The system says "Created." Period. Confidence, not apology.

[SCREEN: The Events table. One row: "Saturday Breathwork | 2026-04-19 | 90 minutes. Bring a mat."]

NARRATOR: And there it is. On the list. Ready for the public page.

---

## THE WOW — THE PUBLIC VIEW (1:30–1:55)

[SCREEN: Switch to a new browser tab. Navigate to the public Sunrise Yoga website.]

NARRATOR: Now here's the part Sarah cares about.

[SCREEN: Click "Events" in the main navigation.]

NARRATOR: Her student clicks Events—

[SCREEN: The Events page loads. "Saturday Breathwork" is right there. Clean. Real.]

NARRATOR: —and it's *there*. Not in an email attachment. Not in a Google Doc. On her website. Where it belongs.

[SCREEN: The page, simple and complete. Maybe a student's cursor hovers, ready to click.]

NARRATOR: Forty people can see it now. Right now. Because we fixed three lines of code and deleted two fields nobody asked for.

---

## THE CLOSE (1:55–2:00)

[SCREEN: Fade to the EventDash logo. Simple. Clean.]

NARRATOR: EventDash. It works now.

[SCREEN: Black.]

---

*End of demo.*
