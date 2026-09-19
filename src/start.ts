import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

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
      throw error;
    }

    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
