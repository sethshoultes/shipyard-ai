import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Deploys the generated worker to Cloudflare using wrangler
 * Provides human-friendly error messages
 */
export async function deploy(outputDir: string): Promise<void> {
  try {
    // Check if wrangler is installed
    try {
      await execAsync("which wrangler");
    } catch {
      try {
        await execAsync("which npx");
      } catch {
        throw new Error(
          "wrangler CLI not found. Install it with: npm install -g wrangler"
        );
      }
      // Use npx to run wrangler
      await runWithNpx(outputDir);
      return;
    }

    // wrangler is available, run deploy directly
    await runWranglerDeploy(outputDir);
  } catch (error) {
    handleDeployError(error);
  }
}

async function runWranglerDeploy(outputDir: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(
      `cd "${outputDir}" && wrangler deploy`,
      { encoding: "utf8" }
    );

    if (stderr && !stderr.includes("Deployed") && !stderr.includes("Success")) {
      console.warn(stderr);
    }

    if (stdout) {
      console.log(stdout);
    }
  } catch (error) {
    throw error;
  }
}

async function runWithNpx(outputDir: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(
      `cd "${outputDir}" && npx wrangler deploy`,
      { encoding: "utf8" }
    );

    if (stderr && !stderr.includes("Deployed") && !stderr.includes("Success")) {
      console.warn(stderr);
    }

    if (stdout) {
      console.log(stdout);
    }
  } catch (error) {
    throw error;
  }
}

function handleDeployError(error: unknown): never {
  if (error instanceof Error) {
    const message = error.message;

    // Translate common wrangler errors to human-friendly messages
    if (message.includes("You must log in")) {
      throw new Error(
        "Not logged in to Cloudflare. Run 'wrangler login' first, then try again."
      );
    }

    if (message.includes("Account ID")) {
      throw new Error(
        "Missing account configuration. Run 'wrangler whoami' to set up your account."
      );
    }

    if (message.includes("ENOENT") || message.includes("not found")) {
      throw new Error(
        "wrangler CLI not found. Install it with: npm install -g wrangler"
      );
    }

    if (message.includes("bindings")) {
      throw new Error(
        "AI binding configuration issue. Check your wrangler.toml file."
      );
    }

    if (message.includes("rate limit") || message.includes("quota")) {
      throw new Error(
        "Deployment rate limit reached. Wait a moment and try again."
      );
    }

    // Generic error with context
    throw new Error(`Deploy failed: ${message}`);
  }

  throw new Error("Deploy failed: Unknown error occurred");
}
