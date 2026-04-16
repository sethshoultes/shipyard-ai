commit cbe79e350e9532089f353e71d90b3ba178b41108
Author: Phil Jackson (Shipyard AI) <phil@shipyard.company>
Date:   Thu Apr 16 15:49:51 2026 +0000

    daemon: auto-commit 1 files

diff --git a/examples/sunrise-yoga/astro.config.mjs b/examples/sunrise-yoga/astro.config.mjs
index 2387125..1ac6941 100644
--- a/examples/sunrise-yoga/astro.config.mjs
+++ b/examples/sunrise-yoga/astro.config.mjs
@@ -8,7 +8,6 @@ import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";
 import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";
 import { formforgePlugin } from "../../plugins/formforge/src/index.js";
 import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";
-import { seodashPlugin } from "../../plugins/seodash/src/index.js";
 
 export default defineConfig({
   site: "https://yoga.shipyard.company",
@@ -25,7 +24,6 @@ export default defineConfig({
         commercekitPlugin(),
         formforgePlugin(),
         reviewpulsePlugin(),
-        seodashPlugin(),
       ],
     }),
   ],
