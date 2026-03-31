// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets an httpOnly auth-token cookie", async () => {
  const { createSession } = await import("../auth");

  await createSession("user-1", "user@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name, _token, options] = mockCookieStore.set.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(typeof _token).toBe("string");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession cookie expires in ~7 days", async () => {
  const { createSession } = await import("../auth");

  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const expiresMs = options.expires.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expiresMs).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession token is a signed JWT string", async () => {
  const { createSession } = await import("../auth");

  await createSession("user-1", "user@example.com");

  const [, token] = mockCookieStore.set.mock.calls[0];
  // JWTs have three base64url segments separated by dots
  expect(token.split(".")).toHaveLength(3);
});
