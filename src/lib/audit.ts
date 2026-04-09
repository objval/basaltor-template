import { db } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema";

export async function writeAuditLog(input: {
  actorUserId?: string | null;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    resource: input.resource,
    details: input.details ?? {},
  });
}
