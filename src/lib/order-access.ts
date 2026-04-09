import { createHash, randomBytes } from "node:crypto";

export const GUEST_ORDER_TOKEN_TTL_DAYS = 30;

export function createGuestAccessToken() {
  return randomBytes(24).toString("base64url");
}

export function hashGuestAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyGuestAccessToken(input: { token: string; tokenHash: string | null | undefined }) {
  if (!input.tokenHash) {
    return false;
  }

  return hashGuestAccessToken(input.token) === input.tokenHash;
}

export function getGuestAccessExpiryDate(now = new Date()) {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + GUEST_ORDER_TOKEN_TTL_DAYS);
  return expiresAt;
}

export function buildGuestOrderAccessUrl(input: { appUrl: string; publicId: string; token: string }) {
  const url = new URL(`/guest/orders/${input.publicId}`, input.appUrl);
  url.searchParams.set("token", input.token);
  return url.toString();
}
