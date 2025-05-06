import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: ['http://127.0.0.1:2100', 'http://localhost:2100', 'http://localhost', 'http://127.0.0.1']
  },
};

export default nextConfig;
