// Importing env files here to validate on build
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@bachira/api",
    "@bachira/db",
    "@bachira/ui",
    "@bachira/validators",
    "@bachira/supabase"
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
      },
      {
        hostname: "utfs.io",
        protocol: "https",
      },
      {
        hostname: "uploadthing.com",
        protocol: "https",
      },
    ],
  },
};

export default config;
