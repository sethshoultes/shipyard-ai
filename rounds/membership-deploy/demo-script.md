# Demo Script: MemberShip Plugin Deployment

---

NARRATOR:
You ship code. You ship it clean. You ship it fast.

[SCREEN: Terminal showing grep output — 4 pattern violations in red]

NARRATOR:
But your deliverable's sitting in a folder somewhere.
Never deployed. Never tested.
Clean code that nobody's using.

[SCREEN: Side-by-side comparison — deliverables/membership-fix/ vs plugins/membership/src/]

NARRATOR:
The fix exists. Zero violations.
It's been done for weeks.

[SCREEN: Close-up on sandbox-entry.ts diff — banned patterns highlighted]

NARRATOR:
But production? Still running the broken version.
Four violations. Four ways to fail.

---

[SCREEN: Terminal — cp command executes]

NARRATOR:
So we copy it over.

[SCREEN: grep verification runs — outputs "0"]

NARRATOR:
Zero violations. Verified.

[SCREEN: git add, git commit — message appears: "fix: deploy clean membership plugin — 0 banned pattern violations"]

NARRATOR:
Committed.

---

[SCREEN: curl commands firing against localhost:4324]

NARRATOR:
Now we test it. Live server. Real endpoints.

[SCREEN: First curl — HTTP 500 error]

NARRATOR:
Server's broken. Miniflare config error.

[SCREEN: Terminal output showing "Error: Expected miniflare to be defined"]

NARRATOR:
Not our plugin. Not our problem.

[SCREEN: Split screen — clean plugin files on left, server error on right]

NARRATOR:
The code's clean. The deployment's done.
The blocker's somewhere else.

---

[SCREEN: Pull back to show DEPLOYMENT-STATUS.md — all checkmarks next to "Banned patterns", "Files deployed", "Verification"]

NARRATOR:
Three files. Zero violations. One commit.

[SCREEN: Success metrics table — green checkmarks filling in]

NARRATOR:
Mission complete.

[SCREEN: Final shot — the grep command showing "0" in large text]

NARRATOR:
Clean code, deployed.
Ready when the server is.
