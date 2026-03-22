import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import appCss from "../globals.css?url";
import Toolbar from "../components/toolbar/Toolbar";
import Footer from "../components/layout/Footer";
import MobileBlock from "../components/layout/MobileBlock";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SysDesign — Pro System Designer" },
      {
        name: "description",
        content:
          "The most powerful way to visualize and design your system architectures. Cloud-native components, real-time collaboration, and professional layouts.",
      },
      {
        name: "keywords",
        content:
          "system design, architecture diagrams, cloud infra, AWS, GCP, Azure, microservices, diagramming tool",
      },
      {
        name: "og:title",
        content: "SysDesign — Professional Systems Architecture Tool",
      },
      {
        name: "og:description",
        content:
          "Visualize your entire backend, cloud, and microservice architectures with ease. Professional-grade diagramming for high-scale teams.",
      },
      { name: "og:type", content: "website" },
      { name: "og:image", content: "/logo512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SysDesign — Systems Design Visualizer",
      },
      {
        name: "twitter:description",
        content:
          "Visualize your entire backend, cloud, and microservice architectures with ease.",
      },
      { name: "theme-color", content: "#c57642" },
      { name: "robots", content: "index, follow" },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="relative">
        <ThemeProvider>
          <TooltipProvider delay={300}>
            <MobileBlock />
            <div className="flex flex-col h-screen overflow-hidden bg-background">
              <Toolbar />
              <div className="flex-1 flex overflow-hidden relative">
                {children}
              </div>
              <Footer />
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
