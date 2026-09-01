import { lookup } from "node:dns/promises";
import net from "node:net";

// Blocks Server-Side Request Forgery (SSRF): stops the server from being tricked
// into fetching internal/private addresses on behalf of a user.

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
]);

// Private, loopback, link-local, and other non-public ranges we never fetch.
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  // IPv4-mapped IPv6 (e.g. ::ffff:169.254.169.254)
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

function isPrivateAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // not a recognizable IP, treat as unsafe
}

export type SafeUrlResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * Validate a user-supplied URL before the server fetches it.
 * Rejects non-http(s) schemes and any host that resolves to a private,
 * loopback, or link-local address (blocks SSRF to internal services and
 * cloud metadata endpoints).
 */
export async function assertSafeUrl(raw: string): Promise<SafeUrlResult> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, reason: "This address is not allowed" };
  }

  // If the host is already a literal IP, check it directly.
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      return { ok: false, reason: "Private and internal addresses are not allowed" };
    }
    return { ok: true, url: parsed.toString() };
  }

  // Otherwise resolve the hostname and reject if ANY resolved address is private.
  try {
    const records = await lookup(hostname, { all: true });
    if (records.length === 0) {
      return { ok: false, reason: "Could not resolve host" };
    }
    for (const record of records) {
      if (isPrivateAddress(record.address)) {
        return { ok: false, reason: "Host resolves to a private address" };
      }
    }
  } catch {
    return { ok: false, reason: "Could not resolve host" };
  }

  return { ok: true, url: parsed.toString() };
}
