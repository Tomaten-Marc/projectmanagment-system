import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/proxy";

describe("Content Security Policy", () => {
  it("allows the Supabase REST and Realtime endpoints", () => {
    const csp = buildContentSecurityPolicy("test-nonce", false, "https://project.supabase.co");

    expect(csp).toContain("connect-src 'self' https://project.supabase.co wss://project.supabase.co");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("uses ws for a local http Supabase instance", () => {
    const csp = buildContentSecurityPolicy("test-nonce", true, "http://127.0.0.1:54321");

    expect(csp).toContain("http://127.0.0.1:54321 ws://127.0.0.1:54321");
    expect(csp).toContain("'unsafe-eval'");
  });
});
