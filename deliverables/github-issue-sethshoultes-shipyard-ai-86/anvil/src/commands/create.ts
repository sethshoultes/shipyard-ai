import { fetchSpec, parseSpec, type SpecResult } from "../generators/spec.js";
import { generateIndexTs, generateWranglerToml } from "../generators/worker.js";
import { deploy } from "../utils/deploy.js";
import * as fs from "fs";
import * as path from "path";

interface CreateFlags {
  llm: boolean;
  stream: boolean;
}

function spinner(text: string): () => void {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let index = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[index % frames.length]} ${text}`);
    index++;
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write("\r✓ " + text + "\n");
  };
}

export async function createCommand(flags: CreateFlags): Promise<void> {
  const outputDir = path.join(process.cwd(), "my-llm-worker");

  const spin1 = spinner("Fetching Cloudflare Workers AI OpenAPI spec...");
  let specResult: SpecResult;

  try {
    specResult = await fetchSpec();
    spin1();
  } catch (error) {
    spin1();
    const message = error instanceof Error ? error.message : "Failed to fetch spec";
    throw new Error(`Spec fetch failed: ${message}`);
  }

  const spin2 = spinner("Parsing spec and selecting best model...");
  const modelInfo = parseSpec(specResult);
  spin2();

  const spin3 = spinner("Generating streaming worker code...");
  const indexTs = generateIndexTs(modelInfo);
  const wranglerToml = generateWranglerToml(modelInfo);
  spin3();

  const spin4 = spinner(`Writing files to ${outputDir}...`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, "index.ts"), indexTs);
  fs.writeFileSync(path.join(outputDir, "wrangler.toml"), wranglerToml);
  spin4();

  const spin5 = spinner("Deploying to Cloudflare Workers...");
  try {
    await deploy(outputDir);
    spin5();
  } catch (error) {
    spin5();
    const message = error instanceof Error ? error.message : "Deployment failed";
    throw new Error(`Deploy failed: ${message}`);
  }

  console.log("");
  console.log("🔥 Your AI worker is LIVE and streaming!");
  console.log(`   Endpoint: https://my-llm-worker.<your-subdomain>.workers.dev`);
  console.log("");
  console.log("   First streaming response incoming... time to grin.");
  console.log("");
}
