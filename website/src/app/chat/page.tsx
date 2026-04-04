"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_API = "https://shipyard-prd-chat.seth-a02.workers.dev/chat";
const CONTACT_API = "https://shipyard-contact.seth-a02.workers.dev/submit";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [prd, setPrd] = useState<string | null>(null);
  const [prdSubmitted, setPrdSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (data.prdReady && data.prd) {
        setPrd(data.prd);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function submitPrd() {
    if (!prd || prdSubmitted) return;
    setPrdSubmitted(true);
    setSubmitStatus("Submitting...");
    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "PRD Chat Submission",
          email: "chat@shipyard.company",
          projectType: "AI-Generated PRD",
          budget: "",
          description: prd,
        }),
      });
      const data = await res.json();
      setSubmitStatus(data.success ? "PRD submitted! We'll be in touch within 24 hours." : "Submission failed. Please copy the PRD above and email it to hello@shipyard.company.");
    } catch {
      setSubmitStatus("Network error. Please copy the PRD and email it to hello@shipyard.company.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8" style={{ height: "calc(100vh - 64px)" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">PRD Builder</h1>
        <p className="mt-1 text-sm text-muted">
          Describe your project and our AI will help you build a PRD.
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted">
            <div>
              <p className="text-lg font-medium text-foreground">Start a conversation</p>
              <p className="mt-1">Tell us what you want to build.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-background border border-border text-foreground rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRD Output */}
        {prd && (
          <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-accent">Your PRD</h3>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted">{prd}</pre>
            {!prdSubmitted ? (
              <button
                onClick={submitPrd}
                className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dim"
              >
                Submit PRD
              </button>
            ) : (
              <p className="mt-4 text-sm text-accent">{submitStatus}</p>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="mt-4 flex gap-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your project..."
          disabled={loading}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dim disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
