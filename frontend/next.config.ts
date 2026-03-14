import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/backend/:path*',
                destination: 'http://localhost:5001/api/:path*',
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'smartseller-backend.vercel.app',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '*.vercel.app',
                pathname: '/uploads/**',
            },
        ],
    },
    // Ignore ESLint errors during production build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignore TypeScript errors during production build
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
