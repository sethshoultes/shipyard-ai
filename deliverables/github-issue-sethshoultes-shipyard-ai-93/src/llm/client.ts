import { API_ENDPOINT, TIMEOUT_MS, API_KEY_ENV } from "../config/constants.js";

interface Message {
  role: string;
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: Message[];
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

export async function fetchSuggestion(system: string, userPrompt: string): Promise<string> {
  const apiKey = process.env[API_KEY_ENV];
  if (!apiKey) {
    throw new Error(`Environment variable ${API_KEY_ENV} is not set`);
  }

  const body: AnthropicRequest = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 256,
    system,
    messages: [{ role: "user", content: userPrompt }],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`LLM API returned ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    const text = data.content?.[0]?.text?.trim();

    if (!text) {
      throw new Error("LLM returned empty text");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
