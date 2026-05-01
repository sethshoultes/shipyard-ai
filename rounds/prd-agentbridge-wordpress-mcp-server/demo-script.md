# AgentBridge WordPress MCP Server — 2-Minute Demo Script

NARRATOR
You run four WordPress sites. You just opened four tabs. Four logins. Four dashboards that load like it's 2009.

[SCREEN: Four browser tabs loading WP admin. Spinning wheels. User's cursor hovering, waiting.]

NARRATOR
You need to publish a client announcement on all four. By noon. It's 11:47.

[SCREEN: Clock ticking. User sighs. Opens a fifth tab — Claude Desktop.]

NARRATOR
So you install one plugin. One. AgentBridge. Click activate.

[SCREEN: WP Plugins screen. "Activate AgentBridge" button clicked. Tools → Relay page appears with endpoint URL and token.]

NARRATOR
Copy this. Paste there. Done.

[SCREEN: Copy endpoint URL and Bearer token. Paste into Claude Desktop `mcp.json`. Save.]

NARRATOR
Now watch.

[SCREEN: Claude Desktop chat. User types: "Create a draft post titled 'Q3 Update' on all four sites."]

NARRATOR
Claude asks your sites what they are. They answer. He writes the post. Pushes it. Four times. Eight seconds.

[SCREEN: Rapid-fire JSON-RPC calls: `tools/list`, `create_post` × 4. Success responses stream back. Draft links appear in chat.]

NARRATOR
No XML-RPC. No REST API wrestling. No tab switching. Your sites can finally talk.

[SCREEN: User clicks a draft link. Perfect post, live in WP editor, ready to publish.]

NARRATOR
Update it? "Change the headline." Delete it? "Trash the draft." He just... does it.

[SCREEN: User types "Update the headline to 'Q3 Results Are In'" — Claude calls `update_post`. Refresh. Changed.]

NARRATOR
Four sites. One sentence. Zero dashboards.

[SCREEN: Four site frontends, identical fresh posts, published simultaneously.]

NARRATOR
That's not a workflow. That's a conversation.

[SCREEN: Black screen. White text: "AgentBridge. Your site is now listening."]
