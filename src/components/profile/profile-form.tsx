import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  session,
}: {
  session: NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>;
}) {
  const [name, setName] = useState(session.user.name);
  const [image, setImage] = useState(session.user.image ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        setError(null);

        await authClient.updateUser(
          {
            name,
            image: image || undefined,
          },
          {
            onSuccess: () => {
              setMessage("Profile updated.");
            },
            onError: (context) => {
              setError(context.error.message);
            },
          },
        );

        setPending(false);
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-image">Avatar URL</Label>
        <Input id="profile-image" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://…" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={session.user.email} disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-note">Template note</Label>
        <Textarea id="profile-note" value="Role, profile editing, and protected routes are wired into the base template." disabled className="min-h-24" />
      </div>
      {message ? <Alert><AlertDescription>{message}</AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
