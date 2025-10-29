import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  }
};

export default nextConfig;
