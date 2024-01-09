/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

// ["lh3.googleusercontent.com", "utfs.io", "uploadthing.com"]

/** @type {import("next").NextConfig} */
const config = {
  images: {
  //  domains: ["lh3.googleusercontent.com", "utfs.io", "uploadthing.com"]
  remotePatterns: [
    {
      hostname: "lh3.googleusercontent.com",
      protocol: "https"
    },
    {
      hostname: "utfs.io",
      protocol: "https"
    },
    {
      hostname: "uploadthing.com",
      protocol: "https"
    }
  ]
  },
};

export default config;
