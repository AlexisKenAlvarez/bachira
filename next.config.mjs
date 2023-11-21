/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

// ["lh3.googleusercontent.com", "utfs.io", "uploadthing.com"]

/** @type {import("next").NextConfig} */
const config = {
  images: {
   domains: ["lh3.googleusercontent.com", "utfs.io", "uploadthing.com"]
  },
};

export default config;
