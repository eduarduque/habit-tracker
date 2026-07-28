import type { NextConfig } from "next";

// GitHub Pages serves this app from https://<user>.github.io/habit-tracker/,
// so the built assets need that path prefix — but only for the Pages build
// (GITHUB_ACTIONS is set there), never for local dev/build.
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? "/habit-tracker" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
