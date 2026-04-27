"use client";

import { useEffect, useState } from "react";

interface RenderStatusProps {
  jobId: string;
}

export default function RenderStatus({ jobId }: RenderStatusProps) {
  const [status, setStatus] = useState<"pending" | "done" | "failed">(
    "pending"
  );
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await fetch(`/api/download?jobId=${jobId}`);
        const data = await res.json();
        setStatus(data.status);
        if (data.url) setUrl(data.url);
      } catch {
        // silently retry
      }
    };

    poll();
    interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 10,
        background: "#12121a",
        border: "1px solid #27272a",
      }}
    >
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#d4d4d8",
          marginBottom: 8,
        }}
      >
        Render Status
      </div>

      {status === "pending" && (
        <div>
          <div
            style={{
              fontSize: "1rem",
              color: "#f2f2f7",
              marginBottom: 6,
            }}
          >
            Rendering your video...
          </div>
          <div style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>
            This usually takes a few minutes. You can leave this page — your
            download link will be ready here.
          </div>
        </div>
      )}

      {status === "done" && url && (
        <div>
          <div
            style={{
              fontSize: "1rem",
              color: "#86efac",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Your video is ready!
          </div>
          <a
            href={url}
            download
            style={{
              display: "inline-block",
              padding: "12px 20px",
              borderRadius: 8,
              background: "#6366f1",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9375rem",
            }}
          >
            Download MP4
          </a>
        </div>
      )}

      {status === "failed" && (
        <div style={{ fontSize: "1rem", color: "#fca5a5" }}>
          Something went wrong while rendering. Please try again.
        </div>
      )}
    </div>
  );
}
