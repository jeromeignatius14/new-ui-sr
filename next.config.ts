/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /\/api\//,
      handler: "NetworkOnly",
    },
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
