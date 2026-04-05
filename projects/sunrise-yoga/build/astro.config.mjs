import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";
import { eventdashPlugin } from "@shipyard/eventdash";
import { membershipPlugin } from "@shipyard/membership";

export default defineConfig({
	site: "https://yoga.shipyard.company",
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data.db" }),
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
			plugins: [eventdashPlugin(), membershipPlugin()],
		}),
	],
	devToolbar: { enabled: false },
	vite: { server: { allowedHosts: true } },
});
