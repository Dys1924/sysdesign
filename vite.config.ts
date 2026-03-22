import { createLogger, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const config = defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      router: {
        routesDirectory: "routes",
      },
      srcDirectory: "src",
    }),
    viteReact(),
    tailwindcss(),
  ],
  ssr: {
    noExternal: [
      "@xyflow/react",
      "@tanstack/react-store",
      "@tanstack/store",
      "@tabler/icons-react",
    ],
  },
  build: {
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
  optimizeDeps: {
    include: ["@tabler/icons-react"],
  },
  customLogger: {
    ...createLogger(),
    warn: (msg, options) => {
      if (msg.includes("points to missing source files")) return;
      createLogger().warn(msg, options);
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
});

export default config;
