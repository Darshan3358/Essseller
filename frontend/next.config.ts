import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const backendUrl = apiUrl.replace(/\/api$/, '');
        return [
            {
                source: '/backend/:path*',
                destination: `${apiUrl}/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/uploads/**',
            },
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
