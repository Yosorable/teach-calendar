import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        config: "./config.html",
      },
    },
  },
  base: "",
  server: {
    host: "0.0.0.0",
  },
});
