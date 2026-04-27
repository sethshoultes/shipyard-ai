"use client";

const VOICES = [
  {
    id: "rachel",
    label: "Rachel",
    description: "Warm & conversational",
  },
  {
    id: "josh",
    label: "Josh",
    description: "Clear & authoritative",
  },
  {
    id: "bella",
    label: "Bella",
    description: "Bright & energetic",
  },
];

interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string) => void;
}

export default function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          marginBottom: 12,
          color: "#d4d4d8",
        }}
      >
        Voice
      </legend>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {VOICES.map((voice) => (
          <label
            key={voice.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 8,
              border:
                value === voice.id
                  ? "1px solid #6366f1"
                  : "1px solid #27272a",
              background: value === voice.id ? "#1e1b4b" : "#12121a",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
          >
            <input
              type="radio"
              name="voice"
              value={voice.id}
              checked={value === voice.id}
              onChange={() => onChange(voice.id)}
              style={{ cursor: "pointer" }}
            />
            <div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#f2f2f7",
                }}
              >
                {voice.label}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "#a1a1aa",
                  marginTop: 2,
                }}
              >
                {voice.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
