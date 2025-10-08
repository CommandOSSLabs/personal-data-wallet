/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],
  },
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'encoding');

    // Exclude Node.js native modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };

      // Ignore hnswlib-node for client-side
      config.externals.push('hnswlib-node');
    }

    return config;
  },
};

module.exports = nextConfig;
