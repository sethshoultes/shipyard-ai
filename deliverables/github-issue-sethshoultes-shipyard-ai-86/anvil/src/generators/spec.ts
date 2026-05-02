/**
 * Fetches and parses the Cloudflare Workers AI OpenAPI spec
 * Returns model info for the best text-generation model
 */

export interface ModelInfo {
  name: string;
  version: string;
  bindingName: string;
}

export interface SpecResult {
  models: ModelInfo[];
  fallbackModel: ModelInfo;
}

const CLOUDFLARE_AI_SPEC_URL = "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/models";

const FALLBACK_MODELS: ModelInfo[] = [
  { name: "@cf/meta/llama-3-8b-instruct", version: "1.0.0", bindingName: "AI" },
  { name: "@cf/meta/llama-2-7b-chat-int8", version: "0.9.0", bindingName: "AI" },
];

export async function fetchSpec(): Promise<SpecResult> {
  try {
    // Note: In production, this would use the actual Cloudflare API with auth
    // For now, we fetch the public documentation endpoint
    const response = await fetch("https://developers.cloudflare.com/workers-ai/models/index.json", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return parseSpecData(data);
  } catch (error) {
    console.warn("Could not fetch live spec, using fallback models");
    return {
      models: FALLBACK_MODELS,
      fallbackModel: FALLBACK_MODELS[0],
    };
  }
}

function parseSpecData(data: unknown): SpecResult {
  const models: ModelInfo[] = [];

  if (data && typeof data === "object" && "models" in data) {
    const modelsData = data.models as Record<string, unknown>;
    for (const [modelName, modelDetails] of Object.entries(modelsData)) {
      if (
        modelDetails &&
        typeof modelDetails === "object" &&
        "task_type" in modelDetails
      ) {
        const details = modelDetails as { task_type: string; version?: string };
        if (details.task_type === "text-generation") {
          models.push({
            name: modelName,
            version: details.version || "1.0.0",
            bindingName: "AI",
          });
        }
      }
    }
  }

  // Sort by version to get the highest
  models.sort((a, b) => compareVersions(b.version, a.version));

  const fallbackModel = models.length > 0 ? models[0] : FALLBACK_MODELS[0];

  return {
    models,
    fallbackModel,
  };
}

export function parseSpec(result: SpecResult): ModelInfo {
  if (result.models.length === 0) {
    console.warn("No text-generation models found in spec, using fallback");
    return result.fallbackModel;
  }

  const bestModel = result.models[0];
  console.log(`Selected model: ${bestModel.name} (v${bestModel.version})`);
  return bestModel;
}

function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aNum = aParts[i] || 0;
    const bNum = bParts[i] || 0;
    if (aNum !== bNum) {
      return aNum - bNum;
    }
  }
  return 0;
}
