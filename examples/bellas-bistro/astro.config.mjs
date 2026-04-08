import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://bellas.shipyard.company",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  devToolbar: { enabled: false },
	vite: { server: { allowedHosts: true } },
});
