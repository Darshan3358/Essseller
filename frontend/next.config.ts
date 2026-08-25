import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        const isProd = process.env.NODE_ENV === 'production';
        // Use environment variable if set, otherwise fallback to local/live defaults
        const backendUrl = process.env.BACKEND_URL || (isProd ? 'https://smartseller-backend.vercel.app' : 'http://localhost:5001');
        
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/backend/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
            {
                source: '/product_images/:path*',
                destination: `${backendUrl}/product_images/:path*`,
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/admin/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'sellerdock.ess-pvt.net',
                    },
                ],
                destination: '/',
                permanent: false,
            },
            {
                source: '/admin',
                has: [
                    {
                        type: 'host',
                        value: 'sellerdock.ess-pvt.net',
                    },
                ],
                destination: '/',
                permanent: false,
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '5001',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'smartseller-backend.vercel.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.vercel.app',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '*.vercel.app',
                pathname: '/product_images/**',
            },
            {
                protocol: 'https',
                hostname: '*.ess-pvt.net',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '*.ess-pvt.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
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
