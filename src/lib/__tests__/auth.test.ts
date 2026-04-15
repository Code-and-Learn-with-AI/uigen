// @vitest-environment node
import { test, expect, vi, beforeEach, describe } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

import { createSession, getSession, deleteSession, verifySession } from "@/lib/auth";
import { NextRequest } from "next/server";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  test("sets an httpOnly cookie with a JWT token", async () => {
    await createSession("user-123", "user@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledOnce();
    const [cookieName, token, options] = mockCookieStore.set.mock.calls[0];

    expect(cookieName).toBe("auth-token");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // valid JWT format
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  test("sets cookie expiry ~7 days in the future", async () => {
    const before = Date.now();
    await createSession("user-123", "user@example.com");
    const after = Date.now();

    const [, , options] = mockCookieStore.set.mock.calls[0];
    const expiresMs = options.expires.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDays - 1000);
    expect(expiresMs).toBeLessThanOrEqual(after + sevenDays + 1000);
  });
});

describe("getSession", () => {
  test("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null when cookie contains an invalid token", async () => {
    mockCookieStore.get.mockReturnValue({ value: "invalid.jwt.token" });

    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns session payload for a valid token", async () => {
    // Create a real session first to get a valid token
    let capturedToken: string = "";
    mockCookieStore.set.mockImplementation((_name: string, token: string) => {
      capturedToken = token;
    });
    await createSession("user-123", "user@example.com");

    // Now use that token in getSession
    mockCookieStore.get.mockReturnValue({ value: capturedToken });
    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-123");
    expect(session?.email).toBe("user@example.com");
  });
});

describe("deleteSession", () => {
  test("deletes the auth-token cookie", async () => {
    await deleteSession();

    expect(mockCookieStore.delete).toHaveBeenCalledOnce();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
  });
});

describe("verifySession", () => {
  test("returns null when no cookie is present in request", async () => {
    const request = new NextRequest("http://localhost/api/test");

    const session = await verifySession(request);
    expect(session).toBeNull();
  });

  test("returns null for an invalid token in request", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: { cookie: "auth-token=invalid.jwt.token" },
    });

    const session = await verifySession(request);
    expect(session).toBeNull();
  });

  test("returns session payload for a valid token in request", async () => {
    // Create a real token via createSession
    let capturedToken: string = "";
    mockCookieStore.set.mockImplementation((_name: string, token: string) => {
      capturedToken = token;
    });
    await createSession("user-456", "another@example.com");

    const request = new NextRequest("http://localhost/api/test", {
      headers: { cookie: `auth-token=${capturedToken}` },
    });
    const session = await verifySession(request);

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-456");
    expect(session?.email).toBe("another@example.com");
  });
});
