import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig((ctx) => {
  const env = loadEnv(ctx.mode, "./", ["FRONTEND_", "BIND_IP"]) as Record<
    string,
    any
  >;
  return {
    build: {
      sourcemap: true, // Source map generation must be turned on
      outDir: "./dist",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("react") || id.includes("recoil")) return "react";
            if (id.includes("pixi")) return "pixi";
            if (id.includes("mdi")) return "icons";
            if (id.includes("moment")) return "moment";
            if (id.includes("pngjs")) return "pngjs";
          },
        },
        treeshake: true,
      },
      target: "esnext",
    },

    plugins: [tsconfigPaths(), react()],
    envPrefix: "FRONTEND_",
    server: {
      port: env.FRONTEND_PORT,
      host: env.BIND_IP,
      hmr: {
        port: env.FRONTEND_PORT,
        host: env.BIND_IP,
      },
    },
  };
});
