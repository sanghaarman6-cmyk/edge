import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/training',
        permanent: false, // keep false for now
      },
    ];
  },
};

export default nextConfig;
