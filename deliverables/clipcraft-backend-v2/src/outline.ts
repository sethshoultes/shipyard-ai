export interface Outline {
  segments: Array<{ text: string; duration: number }>;
}

export async function generateOutline(
  content: string,
  apiKey: string
): Promise<Outline> {
  const prompt = `Create a short video script outline from the article below.
Split it into 3-5 segments. For each segment, provide the narration text and estimated duration in seconds.
Respond in strict JSON: { "segments": [{ "text": "...", "duration": 10 }] }

Article:
${content.slice(0, 4000)}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates video outlines." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI chat completions failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("OpenAI response did not contain valid JSON outline");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Outline;
  if (!Array.isArray(parsed.segments)) {
    throw new Error("Invalid outline structure: missing segments array");
  }
  return parsed;
}
