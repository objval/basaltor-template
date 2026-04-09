function normalizeRelativePath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

export function normalizeRedirectPath(input: string | null | undefined, fallback = "/dashboard") {
  const normalizedFallback = normalizeRelativePath(fallback) ?? "/dashboard";
  return normalizeRelativePath(input) ?? normalizedFallback;
}

export function toRelativeAppPath(input: string | null | undefined, fallback = "/dashboard") {
  const normalizedFallback = normalizeRedirectPath(fallback, "/dashboard");

  if (!input) {
    return normalizedFallback;
  }

  const directPath = normalizeRelativePath(input);
  if (directPath) {
    return directPath;
  }

  try {
    const url = new URL(input);
    return normalizeRedirectPath(`${url.pathname}${url.search}${url.hash}`, normalizedFallback);
  } catch {
    return normalizedFallback;
  }
}
