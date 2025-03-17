/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  webpack: (config) => {
    // Add specific handling for BabylonJS if needed
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any BabylonJS specific aliases if needed
    };
    return config;
  },
};

module.exports = nextConfig; 