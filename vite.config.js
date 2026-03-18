import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig(({ mode }) => ({
  base:
    mode === "production" && import.meta.env.GITHUB_ACTIONS === "true"
      ? "/cogen-calc-app/"
      : "/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
}));
