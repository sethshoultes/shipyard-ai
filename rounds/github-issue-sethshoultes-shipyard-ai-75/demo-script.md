# Demo Script: Platform Trust Through Zero-Error Deployments

**Duration:** 2 minutes

---

NARRATOR:
It's 2 a.m. You pushed code three hours ago. Your phone buzzes.

[SCREEN: Slack notification - "Customer reports plugins not loading"]

NARRATOR:
You check the manifest endpoint. Says two plugins are live. You hit the plugin routes—both return 500 errors.

[SCREEN: Terminal showing curl commands returning INTERNAL_ERROR]

NARRATOR:
The manifest lied.

Your customer doesn't care about your config files. They care that the system they paid for is broken. And you have no idea why.

[SCREEN: Split screen - manifest showing plugins, actual routes failing]

---

NARRATOR:
Here's what we changed.

[SCREEN: Code editor - wrangler.jsonc file]

NARRATOR:
Fix the config. Point plugins to correct entrypoints. Two lines.

[SCREEN: Highlighting plugin path corrections]

NARRATOR:
Build. Deploy.

[SCREEN: Terminal running npm run build && npm run deploy - fast cuts]

NARRATOR:
Now—prove it works.

[SCREEN: Terminal]

```bash
curl https://yoga.shipyard.company/_emdash/api/manifest
```

NARRATOR:
Manifest returns clean JSON. Two plugins: membership, eventdash.

[SCREEN: JSON output, syntax highlighted]

NARRATOR:
But does clean JSON mean they actually work?

[SCREEN: Terminal]

```bash
curl -X POST https://yoga.shipyard.company/_emdash/api/plugins/membership/admin \
  -d '{"type":"page_load"}'
```

NARRATOR:
Membership plugin responds. No 500. No internal error.

[SCREEN: Valid JSON response]

```bash
curl -X POST https://yoga.shipyard.company/_emdash/api/plugins/eventdash/admin \
  -d '{"type":"page_load"}'
```

NARRATOR:
Eventdash responds. Both plugins verified. Not "probably working"—proven.

[SCREEN: Valid JSON response]

---

NARRATOR:
One more thing. Humans lie to themselves. Computers don't.

[SCREEN: Terminal]

```python
python3 -c "
import requests
manifest = requests.get('.../_emdash/api/manifest').json()
plugins = {p['id'] for p in manifest['plugins']}
assert plugins == {'membership', 'eventdash'}
print('PASS')
"
```

[SCREEN: Output shows "PASS"]

NARRATOR:
Assertion passes. The manifest doesn't lie anymore.

---

NARRATOR:
Commit. Push. Done.

[SCREEN: Git commit message]

```
fix: Deploy Sunrise Yoga with verified plugins

- Fixed wrangler.jsonc plugin paths
- Verified membership and eventdash load correctly
- All smoke tests passing
- Manifest endpoint reflects reality

Resolves #75
```

[SCREEN: GitHub shows issue #75 auto-closed]

---

NARRATOR:
It's not about the tools. Bash scripts. Curl commands. Python assertions. Anyone can run these.

[SCREEN: Simple bash script file]

NARRATOR:
It's about what you promise.

When your manifest says two plugins are live, they're live. When you deploy, you prove it works before you walk away.

[SCREEN: Developer closing laptop, confident]

NARRATOR:
No 2 a.m. wake-ups. No "probably works." No guessing.

[SCREEN: Manifest endpoint returning clean JSON, plugin routes all green]

NARRATOR:
Platform trust isn't built with documentation.

It's built with deployments that never lie.

[SCREEN: Fade to logo/tagline]

**"Ship simple. Prove everything. Automate."**
