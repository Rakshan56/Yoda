import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/pokemon_guide";
process.env.JWT_ACCESS_SECRET ??= "test-secret-that-is-at-least-thirty-two-characters";

let app: (typeof import("../../src/app.js"))["app"];
beforeAll(async () => {
  ({ app } = await import("../../src/app.js"));
});

describe("foundation endpoints", () => {
  it("returns the liveness envelope", async () => {
    const response = await request(app).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
  });

  it("rejects unknown routes with the standard error envelope", async () => {
    const response = await request(app).get("/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect(response.body.error.request_id).toEqual(expect.any(String));
  });

  it("rejects cookie-authenticated mutations without a CSRF token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", ["yoda_refresh_token=present"]);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("protects admin routes with authentication", async () => {
    const response = await request(app).get("/api/v1/admin/quality-issues");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("protects helper conversations with authentication", async () => {
    const response = await request(app).get("/api/v1/helper/conversations");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });
});
