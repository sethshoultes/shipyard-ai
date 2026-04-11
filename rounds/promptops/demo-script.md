# Drift Demo Script
*Runtime: ~2 minutes*

---

[SCREEN: Dark terminal, cursor blinking. 2:47 AM timestamp in corner.]

**NARRATOR:** It's three in the morning. Your phone buzzes. Support ticket: "The AI is telling customers to contact our competitor."

[SCREEN: Slack notification slides in. Screenshot of chatbot response recommending a competitor by name.]

**NARRATOR:** You know exactly what happened. Someone pushed a prompt change to production six hours ago. Except you don't know *who*, you don't know *what* they changed, and you definitely don't have a way to undo it.

[SCREEN: Quick cuts — frantic scrolling through Git history, grep commands returning nothing, a Notion doc titled "prompts_v3_FINAL_v2.txt"]

**NARRATOR:** So you do what everyone does. You open seventeen browser tabs. You Slack the person who might have touched it. You wait. The chatbot keeps recommending your competitor.

[SCREEN: Terminal goes dark. Beat. Then: `$ drift init`]

**NARRATOR:** This is Drift. And that nightmare? It ends right here.

[SCREEN: Terminal executes `drift init my-project`. Output appears:
```
Initializing Drift project...

Project initialized: my-project
API Key: dk_1a2b3c4d...

⚠️  Save this key! It won't be shown again.
```]

**NARRATOR:** No signup form. No OAuth dance. No "verify your email." You run one command, you get an API key, you're live.

[SCREEN: Terminal shows `$ drift push system-prompt --file ./prompt.txt`]

**NARRATOR:** Now watch. I've got a prompt in a text file. The same prompt that's been copy-pasted through Slack channels and buried in random repos. Let's give it a proper home.

[SCREEN: Terminal executes. Output:
```
Pushed system-prompt v1.
```]

**NARRATOR:** That's it. Version one. It's stored. It's tracked. It's real.

[SCREEN: Terminal shows same command executed two more times with different files, versions incrementing to v2, v3]

**NARRATOR:** Your teammate pushes a change Tuesday. Another one Thursday. Each one gets a version number. Each one is stored. Nothing disappears into the void.

[SCREEN: Split screen — left side shows terminal, right side shows a curl command fetching the prompt via API]

**NARRATOR:** And here's the thing — your application pulls the prompt from Drift's API at runtime. Not baked into a deploy. Not hardcoded. *Live*.

[SCREEN: Terminal shows `$ drift push system-prompt --file ./bad-prompt.txt -m "added competitor mention"`. Output: `Pushed system-prompt v4.`]

**NARRATOR:** So when that 3 AM nightmare happens — when v4 tells customers to call your competitor —

[SCREEN: Terminal clears. Shows: `$ drift rollback system-prompt --to 3`]

**NARRATOR:** — you don't wake up your entire engineering team. You don't revert a deploy. You don't pray.

[SCREEN: Terminal executes. Output:
```
Rolled back to v3. Live now.
```]

**NARRATOR:** *Live. Now.* Two words. Two seconds. The chatbot is fixed. You go back to sleep.

[SCREEN: Terminal fades. Drift logo appears, minimal. Tagline underneath: "Version control for your AI prompts."]

**NARRATOR:** Git is for code. Drift is for prompts. Because at 3 AM, you shouldn't be digging through Notion docs.

[SCREEN: Single line appears below logo: `npm install -g @drift/cli`]

**NARRATOR:** You should be going back to sleep.

[SCREEN: Fade to black.]

---

*END DEMO*
