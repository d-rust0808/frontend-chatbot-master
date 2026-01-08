/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure CSS is properly processed
  experimental: {
    optimizeCss: false,
  },
  // Webpack config - let Next.js handle cache automatically
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;

