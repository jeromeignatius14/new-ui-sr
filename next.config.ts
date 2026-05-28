/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Never cache Railway backend API calls — always fetch fresh from network
  // This prevents stale cached responses causing "Network Error" on API calls
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/backend-production.*\.up\.railway\.app\/.*/i,
      handler: "NetworkOnly",
    },
  ],
});

const nextConfig = withPWA({
  // your config
  output: 'standalone',
  experimental: {
    appDir: true,
  },
   turbopack: {},
});

module.exports = nextConfig;
