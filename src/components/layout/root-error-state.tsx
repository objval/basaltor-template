import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return "An unexpected application error occurred.";
}

export function RootErrorState({ error, reset }: { error: unknown; reset: () => void }) {
  const detail = getErrorMessage(error);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 md:px-6">
      <Card className="w-full max-w-xl border-border/80 bg-card/95 shadow-sm backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <BrandMark align="center" eyebrow="Application state" />
          <div className="space-y-2">
            <CardTitle className="text-3xl font-medium tracking-tight">Something went wrong</CardTitle>
            <CardDescription className="text-sm leading-6">
              The app hit an unexpected state. You can retry the current view or return to the storefront.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{detail}</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => reset()}>
              Try again
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/">Return home</Link>
            </Button>
            <Button type="button" variant="ghost" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}