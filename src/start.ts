import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  origin: (origin) => {
    if (!origin) return true;
    try {
      const u = new URL(origin);
      return (
        u.hostname === "localhost" ||
        u.hostname === "127.0.0.1" ||
        u.hostname.endsWith(".vercel.app") ||
        u.hostname.includes("skz") ||
        u.hostname.includes("lootlab") ||
        true
      );
    } catch {
      return true;
    }
  },
  secFetchSite: () => true,
  allowRequestsWithoutOriginCheck: true,
});

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // If request is an API or Server Function RPC call, let the error propagate cleanly instead of returning HTML
    const isRpcOrApi =
      request?.url?.includes("/_serverFn") ||
      request?.headers?.get("accept")?.includes("application/json") ||
      request?.headers?.get("x-ts-server-fn");

    if (isRpcOrApi) {
      console.error("[Server Function Error]:", error);
      const errMsg = (error as any)?.message || String(error);
      const errStack = (error as any)?.stack || "";
      return new Response(JSON.stringify({ success: false, error: errMsg, stack: errStack, isServerFnError: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, errorMiddleware],
}));
