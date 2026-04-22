"use client";

import { useState } from "react";
import VoiceSelector from "./VoiceSelector";
import RenderStatus from "./RenderStatus";

export default function PasteForm() {
  const [input, setInput] = useState("https://example.com/blog/ai-video-generation");
  const [voiceId, setVoiceId] = useState("rachel");
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingRender, setLoadingRender] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJobId(null);
    setLoadingExtract(true);

    try {
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!extractRes.ok) throw new Error("Extraction failed");
      const { keyPoints, title } = await extractRes.json();

      setLoadingRender(true);
      const renderRes = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyPoints, voiceId, title }),
      });
      if (!renderRes.ok) throw new Error("Render queue failed");
      const { jobId: id } = await renderRes.json();
      setJobId(id);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingExtract(false);
      setLoadingRender(false);
    }
  };

  const isLoading = loadingExtract || loadingRender;

  return (
    <div style={{ textAlign: "left" }}>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="paste-input"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: 8,
            color: "#d4d4d8",
          }}
        >
          Blog text or URL
        </label>
        <textarea
          id="paste-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          required
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "1px solid #27272a",
            background: "#12121a",
            color: "#f2f2f7",
            fontSize: "1rem",
            lineHeight: 1.5,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ marginTop: 20 }}>
          <VoiceSelector value={voiceId} onChange={setVoiceId} />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            marginTop: 24,
            width: "100%",
            padding: "14px 20px",
            borderRadius: 10,
            border: "none",
            background: isLoading ? "#3f3f46" : "#6366f1",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          {isLoading
            ? loadingExtract
              ? "Extracting key points..."
              : "Queuing render..."
            : "Create Video"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            background: "#450a0a",
            color: "#fca5a5",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {jobId && <RenderStatus jobId={jobId} />}
    </div>
  );
}
