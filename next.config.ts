/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Optional: disable in dev
});

const nextConfig = withPWA({
  // your config
  experimental: {
    appDir: true,
  },
      // Force Webpack (required for next-pwa)
  webpack: (config: any) => {
    return config;
  },

  // Disable Turbopack to stop the build error
  turbopack: false,
});

module.exports = nextConfig;
