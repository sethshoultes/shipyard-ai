import { initWasm, Resvg } from "@resvg/resvg-wasm";
// @ts-ignore - wasm supplied by wrangler CompiledWasm rule
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
// @ts-ignore - woff2 supplied by wrangler Data rule
import interRegular from "../assets/fonts/Inter-Regular.woff2";
// @ts-ignore
import interBold from "../assets/fonts/Inter-Bold.woff2";
// @ts-ignore
import interExtraBold from "../assets/fonts/Inter-ExtraBold.woff2";

let ready: Promise<void> | null = null;

async function ensureWasm(): Promise<void> {
  if (!ready) {
    ready = initWasm(resvgWasm as any);
  }
  return ready;
}

export async function rasterize(svg: string): Promise<Uint8Array> {
  await ensureWasm();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    background: "#0b1020",
    font: {
      loadSystemFonts: false,
      fontBuffers: [
        new Uint8Array(interRegular as ArrayBuffer),
        new Uint8Array(interBold as ArrayBuffer),
        new Uint8Array(interExtraBold as ArrayBuffer),
      ],
      defaultFontFamily: "Inter",
    },
  });
  const png = resvg.render();
  const bytes = png.asPng();
  return new Uint8Array(bytes);
}
