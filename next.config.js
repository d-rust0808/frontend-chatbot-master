/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure CSS is properly processed
  experimental: {
    optimizeCss: false,
  },
  // Image optimization - allow external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'cchatbot.pro',
      },
    ],
  },
  // Webpack config - externalize ws and socket.io-client for server-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize modules that should not be bundled for server-side
      config.externals = config.externals || [];
      
      // Externalize ws module (required by socket.io-client)
      if (Array.isArray(config.externals)) {
        config.externals.push('ws');
      } else {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          'ws',
        ];
      }
      
      // Externalize socket.io-client to avoid SSR issues
      if (Array.isArray(config.externals)) {
        config.externals.push('socket.io-client');
      } else {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          'socket.io-client',
        ];
      }
    }
    return config;
  },
};

module.exports = nextConfig;

