function getFirstForwardedIp(raw: string | null) {
  if (!raw) return null;
  const [first] = raw.split(",").map((part) => part.trim()).filter(Boolean);
  return first;
}

export type OrderTrackingSnapshot = {
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  acceptLanguage: string | null;
};

export function buildOrderTrackingSnapshot(headers: Headers): OrderTrackingSnapshot {
  const ipAddress =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    getFirstForwardedIp(headers.get("x-forwarded-for")) ??
    null;

  return {
    ipAddress,
    userAgent: headers.get("user-agent"),
    referrer: headers.get("referer"),
    acceptLanguage: headers.get("accept-language"),
  };
}
