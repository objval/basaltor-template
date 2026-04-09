import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";
import { RootErrorState } from "@/components/layout/root-error-state";
import { metadataConfig } from "@/config/metadata";
import { AppHeader } from "@/components/layout/app-header";
import { Providers } from "@/components/providers";
import { APP_DESCRIPTION, APP_FAVICON_PATH, APP_MANIFEST_PATH, APP_NAME } from "@/lib/app-config";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: metadataConfig.openGraphTitle },
      { property: "og:description", content: metadataConfig.openGraphDescription },
      { name: "theme-color", content: metadataConfig.themeColor },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: APP_FAVICON_PATH },
      { rel: "manifest", href: APP_MANIFEST_PATH },
    ],
  }),
  errorComponent: RootErrorState,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <AppHeader />
          {children}
        </Providers>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
