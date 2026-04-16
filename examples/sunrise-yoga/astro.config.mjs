import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";
import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";
import { formforgePlugin } from "../../plugins/formforge/src/index.js";
import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";
import { seodashPlugin } from "../../plugins/seodash/src/index.js";

export default defineConfig({
  site: "https://yoga.shipyard.company",
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [
        membershipPlugin(),
        eventdashPlugin(),
        commercekitPlugin(),
        formforgePlugin(),
        reviewpulsePlugin(),
        seodashPlugin(),
      ],
    }),
  ],
  devToolbar: { enabled: false },
	vite: { server: { allowedHosts: true } },
});
