export interface TTSEnv {
  OPENAI_API_KEY: string;
}

export async function generateSpeech(
  env: TTSEnv,
  text: string,
  voice: string = 'alloy'
): Promise<ArrayBuffer> {
  const allowedVoices = ['alloy', 'echo', 'onyx', 'fable', 'nova', 'shimmer'];
  const safeVoice = allowedVoices.includes(voice) ? voice : 'alloy';

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: safeVoice,
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI TTS error: ${res.status} ${await res.text()}`);
  }

  return await res.arrayBuffer();
}
