import { defineConfig } from "vite";

// BASE_PATH is set by the GitHub Pages workflow (.github/workflows/deploy.yml)
// to "/<repo-name>/" so assets resolve on project pages. Local dev and custom
// domains use the default "/".
export default defineConfig({
  base: process.env.BASE_PATH || "/",
});
