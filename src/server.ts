import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import * as serverApi from "./server/api";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function isApiOrServerFnRequest(request: Request): boolean {
  const url = request.url || "";
  const accept = request.headers.get("accept") || "";
  return (
    url.includes("/_serverFn") ||
    url.includes("/api/") ||
    accept.includes("application/json") ||
    Boolean(request.headers.get("x-ts-server-fn"))
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            version: "v2026.09.20.1",
            hasDbUrl: Boolean(process.env.DATABASE_URL || process.env["DATABASE URL"] || (env as any)?.DATABASE_URL),
            hasAdminPass: Boolean(process.env.ADMIN_PASSWORD || (env as any)?.ADMIN_PASSWORD),
            adminUser: process.env.ADMIN_USERNAME || (env as any)?.ADMIN_USERNAME || "admin",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        );
      }

      if (url.pathname === "/api/admin-login" && request.method === "POST") {
        try {
          const body = await request.json();
          const result = await serverApi.adminLogin(body);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err?.message || "Login failed" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      if (isApiOrServerFnRequest(request)) {
        return response;
      }
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      if (isApiOrServerFnRequest(request)) {
        return new Response(JSON.stringify({ error: (error as any)?.message || "Internal Server Error" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
      return brandedErrorResponse();
    }
  },
};
