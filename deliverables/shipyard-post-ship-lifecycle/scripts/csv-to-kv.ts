/**
 * CSV to KV Upload Script
 * Uploads project data from CSV to Cloudflare KV store
 *
 * Usage: npm run upload-csv
 *
 * Requires:
 * - shipyard-projects.csv in the root directory
 * - CLOUDFLARE_API_TOKEN environment variable
 * - CLOUDFLARE_ACCOUNT_ID environment variable
 * - KV_NAMESPACE_ID environment variable
 */

import * as fs from 'fs';
import * as path from 'path';

interface ProjectCSVRow {
  project_id: string;
  customer_email: string;
  customer_name: string;
  project_url: string;
  ship_date: string;
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): ProjectCSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  // Skip header line
  const dataLines = lines.slice(1);

  const projects: ProjectCSVRow[] = [];

  for (const line of dataLines) {
    // Simple CSV parsing (assumes no commas in values)
    const [project_id, customer_email, customer_name, project_url, ship_date] =
      line.split(',').map(field => field.trim());

    projects.push({
      project_id,
      customer_email,
      customer_name,
      project_url,
      ship_date,
    });
  }

  return projects;
}

/**
 * Upload projects to KV store via Cloudflare API
 */
async function uploadToKV(projects: ProjectCSVRow[]): Promise<void> {
  const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const NAMESPACE_ID = process.env.KV_NAMESPACE_ID;

  if (!API_TOKEN || !ACCOUNT_ID || !NAMESPACE_ID) {
    console.error('Missing required environment variables:');
    console.error('- CLOUDFLARE_API_TOKEN');
    console.error('- CLOUDFLARE_ACCOUNT_ID');
    console.error('- KV_NAMESPACE_ID');
    process.exit(1);
  }

  console.log(`Uploading ${projects.length} projects to KV...`);

  for (const project of projects) {
    const key = `project:${project.project_id}`;
    const value = JSON.stringify({
      project_id: project.project_id,
      customer_email: project.customer_email,
      customer_name: project.customer_name,
      project_url: project.project_url,
      ship_date: project.ship_date,
      unsubscribed: false,
      emails_sent: {},
    });

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: value,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to upload ${project.project_id}:`, error);
    } else {
      console.log(`✓ Uploaded ${project.project_id} (${project.customer_name})`);
    }
  }

  console.log('\nUpload complete!');
}

/**
 * Main script
 */
async function main() {
  try {
    const csvPath = path.join(__dirname, '..', 'shipyard-projects.csv');

    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      process.exit(1);
    }

    console.log('Reading CSV file...');
    const projects = parseCSV(csvPath);
    console.log(`Found ${projects.length} projects\n`);

    await uploadToKV(projects);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
