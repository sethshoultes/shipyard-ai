/**
 * TTS abstraction layer.
 * Maps curated voice aliases to provider voice_id values.
 * Swappable provider: ElevenLabs by default.
 */

export interface Voice {
  voiceId: string;
  label: string;
}

export const VOICES: Voice[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", label: "Rachel" },
  { voiceId: "TX3AEvVoIzMeN81r7j4i", label: "Josh" },
  { voiceId: "XB0fDUnXU5powFXDhCwa", label: "Bella" },
];

export function getVoiceId(alias: string): string | undefined {
  return VOICES.find((v) => v.voiceId === alias || v.label.toLowerCase() === alias.toLowerCase())?.voiceId;
}

export async function tts(text: string, voiceId: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TTS request failed (${res.status}): ${body}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
