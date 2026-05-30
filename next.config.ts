/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Never cache any API calls — always fetch fresh from network
  // Caching API responses causes stale data, SM auto-logout (cached valid:false),
  // and silent failures when session state is checked against a 24h-old cache hit.
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    // Same-origin API routes — NetworkOnly (no cache)
    {
      urlPattern: /\/api\//,
      handler: "NetworkOnly",
    },
    // Railway backend URLs — NetworkOnly (no cache)
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
