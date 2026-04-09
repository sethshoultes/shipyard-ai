import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "emdash-themes";

// Validate environment variables
if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error(
    "Error: Missing required R2 credentials. Please set:"
  );
  console.error("  - CLOUDFLARE_ACCOUNT_ID");
  console.error("  - R2_ACCESS_KEY_ID");
  console.error("  - R2_SECRET_ACCESS_KEY");
  console.error("\nSee .env.example for more details.");
  process.exit(1);
}

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.googleapis.com`,
});

async function uploadTarball(filePath: string, bucketName: string): Promise<void> {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  const fileSizeKB = (fileContent.length / 1024).toFixed(2);

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: "application/gzip",
    });

    await s3Client.send(command);
    console.log(`✓ Uploaded ${fileName} (${fileSizeKB} KB)`);
  } catch (error) {
    console.error(`✗ Failed to upload ${fileName}:`, error);
    throw error;
  }
}

async function uploadAllTarballs(): Promise<void> {
  const themesDir = path.join(__dirname, "..", "dist", "themes");

  if (!fs.existsSync(themesDir)) {
    console.error(`Error: Directory not found: ${themesDir}`);
    console.error("Please run 'npm run build:tarballs' first.");
    process.exit(1);
  }

  const files = fs
    .readdirSync(themesDir)
    .filter((file) => file.endsWith(".tar.gz"));

  if (files.length === 0) {
    console.error("No .tar.gz files found in dist/themes/");
    console.error("Please run 'npm run build:tarballs' first.");
    process.exit(1);
  }

  console.log(`\n🚀 Uploading ${files.length} theme tarballs to R2...`);
  console.log(`   Bucket: ${R2_BUCKET_NAME}`);
  console.log(`   Account: ${CLOUDFLARE_ACCOUNT_ID}`);
  console.log("");

  try {
    for (const file of files) {
      const filePath = path.join(themesDir, file);
      await uploadTarball(filePath, R2_BUCKET_NAME);
    }

    console.log("");
    console.log("✓ All tarballs uploaded successfully!");
    console.log("");
    console.log("R2 URLs:");
    files.forEach((file) => {
      const bucketId = CLOUDFLARE_ACCOUNT_ID;
      const url = `https://pub-${bucketId}.r2.dev/${file}`;
      console.log(`  ${url}`);
    });
  } catch (error) {
    console.error("\n✗ Upload failed. Please check your R2 credentials.");
    process.exit(1);
  }
}

// Run upload
uploadAllTarballs();
