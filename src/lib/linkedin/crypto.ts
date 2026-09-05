import crypto from "crypto";

// AES-256-GCM encryption for LinkedIn tokens at rest. The key is a 32-byte
// value provided as 64 hex chars in LINKEDIN_TOKEN_SECRET.
const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.LINKEDIN_TOKEN_SECRET;
  if (!secret) throw new Error("LINKEDIN_TOKEN_SECRET is not set.");
  const key = Buffer.from(secret, "hex");
  if (key.length !== 32) throw new Error("LINKEDIN_TOKEN_SECRET must be 32 bytes (64 hex chars).");
  return key;
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted value.");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
