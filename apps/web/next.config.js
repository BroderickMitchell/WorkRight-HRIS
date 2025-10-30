/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  transpilePackages: ['@workright/ui'],
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
