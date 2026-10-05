import type { Plugin } from "vite";

const EUROSTAT_PRICE_URL = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2";

// Miniflare's outbound socket can fail on restricted local hosts even when
// Node can reach Eurostat. This fixed-target bridge is available only in dev.
export function localEurostatBridge(): Plugin {
  return {
    name: "local-eurostat-bridge",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__dev/eurostat", async (request, response, next) => {
        if (request.method !== "GET") return next();
        const host = request.headers.host ?? "";
        if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
          response.writeHead(403).end();
          return;
        }
        try {
          const upstream = await fetch(EUROSTAT_PRICE_URL, { signal: AbortSignal.timeout(18000) });
          if (!upstream.ok) throw new Error(`Eurostat returned ${upstream.status}`);
          response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
          response.end(await upstream.text());
        } catch (error) {
          server.config.logger.error(`Local Eurostat bridge failed: ${String(error)}`);
          response.writeHead(502).end();
        }
      });
    },
  };
}
