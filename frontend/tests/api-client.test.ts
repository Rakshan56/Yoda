import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiFetch } from "@/lib/api-client";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "yoda_csrf_token=csrf-value";
    vi.restoreAllMocks();
  });

  it("unwraps the backend data envelope and sends auth headers", async () => {
    localStorage.setItem("yoda_access_token", "access-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    );

    await expect(apiFetch<{ ok: boolean }>("/games")).resolves.toEqual({ ok: true });

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("authorization")).toBe("Bearer access-token");
    expect(options?.credentials).toBe("include");
  });

  it("adds CSRF headers to state-changing requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: null }), { status: 200 })
    );

    await apiFetch("/user/progress/emerald", { method: "PUT", body: "{}" });

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-csrf-token")).toBe("csrf-value");
  });

  it("surfaces structured backend errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Admin access required.", request_id: "req-1" } }), { status: 403 })
    );

    const request = apiFetch("/admin/reports");
    await expect(request).rejects.toMatchObject({ name: "ApiRequestError", code: "FORBIDDEN", requestId: "req-1", message: "Admin access required." } satisfies Partial<ApiRequestError>);
  });

  it("supports empty 204 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("preserves pagination metadata in data responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: "emerald" }], meta: { total: 1 } }), { status: 200 })
    );

    await expect(apiFetch<{ data: { id: string }[]; meta: { total: number } }>("/games")).resolves.toEqual({
      data: [{ id: "emerald" }],
      meta: { total: 1 }
    });
  });

  it("refreshes an expired token and retries the request", async () => {
    localStorage.setItem("yoda_access_token", "expired-token");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Expired." } }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { access_token: "fresh-token" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }));

    await expect(apiFetch<{ ok: boolean }>("/user/progress")).resolves.toEqual({ ok: true });
    expect(localStorage.getItem("yoda_access_token")).toBe("fresh-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
