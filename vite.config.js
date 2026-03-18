import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import process from "node:process";

/// <reference types="node" />

export default defineConfig(({ mode }) => ({
  base:
    mode === "production" && process.env.GITHUB_ACTIONS
      ? "/cogen-calc-app/"
      : "/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
}));
