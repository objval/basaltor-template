import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { Session } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const getSession = createServerFn({ method: "GET" }).handler(async (): Promise<Session | null> => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session as Session | null;
});
