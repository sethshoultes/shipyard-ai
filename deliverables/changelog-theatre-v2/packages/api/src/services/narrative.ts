import type { Commit, ScriptLine } from '../types.js';

export interface NarrativeEnv {
  OPENAI_API_KEY: string;
}

export async function generateNarrative(
  env: NarrativeEnv,
  commits: Commit[]
): Promise<ScriptLine[]> {
  const commitMessages = commits.map((c) => `- ${c.message} (${c.author})`).join('\n');

  const prompt = `You are a cinematic narrator. Turn the following git commit history into a dramatic, Sorkin-style script. Each line should be a short, punchy narration segment with a suggested timestamp in seconds. Keep the total script under 60 seconds. Return ONLY a JSON array of objects with "text" and "timestamp" fields.

Commits:
${commitMessages}
`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content ?? '[]';
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  const lines: ScriptLine[] = jsonMatch ? (JSON.parse(jsonMatch[0]) as ScriptLine[]) : [];

  return lines.length > 0
    ? lines
    : [
        { text: 'The code was written. The commits were made.', timestamp: 0 },
        { text: 'Every line tells a story.', timestamp: 15 },
        { text: 'This is the changelog.', timestamp: 30 },
        { text: 'That was you. That mattered.', timestamp: 50 },
      ];
}
