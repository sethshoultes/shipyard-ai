export async function generateTTS(
  script: string,
  apiKey: string,
  voice: string = "alloy"
): Promise<ArrayBuffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: script.slice(0, 4000),
      voice,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI TTS failed: ${res.status} ${text}`);
  }

  return res.arrayBuffer();
}
