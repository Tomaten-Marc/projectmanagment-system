import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPassword, signOut, redirect, createClient } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  const signOut = vi.fn();
  const redirect = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { signInWithPassword, signOut } }));
  return { signInWithPassword, signOut, redirect, createClient };
});

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { login, logout } from "@/app/login/actions";
import { getAuthRedirect } from "@/lib/supabase/proxy";

describe("authentication", () => {
  beforeEach(() => {
    signInWithPassword.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
  });

  it("signs in a Supabase user with email and password", async () => {
    const form = new FormData(); form.set("email", "User@Example.com"); form.set("password", "test-password");
    await login({ error: null }, form);
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "user@example.com", password: "test-password" });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("rejects an invalid email before contacting Supabase", async () => {
    const form = new FormData(); form.set("email", "not-an-email"); form.set("password", "anything");
    await expect(login({ error: null }, form)).resolves.toEqual({ error: "Invalid email or password." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns the generic error when Supabase rejects the password", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: new Error("provider detail") });
    const form = new FormData(); form.set("email", "user@example.com"); form.set("password", "wrong");
    await expect(login({ error: null }, form)).resolves.toEqual({ error: "Invalid email or password." });
  });

  it("invalidates the local session on logout", async () => {
    await logout();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects unauthenticated users from every protected route", () => {
    expect(getAuthRedirect("/", false)).toBe("/login");
    expect(getAuthRedirect("/tasks", false)).toBe("/login");
    expect(getAuthRedirect("/ap/AP1", false)).toBe("/login");
    expect(getAuthRedirect("/login", false)).toBeNull();
  });

  it("keeps protected routes available to authenticated users", () => {
    expect(getAuthRedirect("/tasks", true)).toBeNull();
    expect(getAuthRedirect("/login", true)).toBe("/");
  });
});
