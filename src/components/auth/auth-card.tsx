import { BrandMark } from "@/components/layout/brand-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  eyebrow,
  children,
  footer,
}: {
  title: string;
  description?: string;
  eyebrow?: string | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-sm backdrop-blur">
      <CardHeader className="space-y-4 text-center">
        <BrandMark eyebrow={eyebrow} align="center" />
        <div className="space-y-2">
          <CardTitle className="text-2xl font-medium tracking-tight">{title}</CardTitle>
          {description ? <CardDescription className="text-sm leading-6">{description}</CardDescription> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
}
