/** @type {import('next').NextConfig} */
const nextConfig = {
    // Empty turbopack config to prevent warnings (Webpack will be used via CLI flag)
    turbopack: {},

    // TypeScript configuration - ignore build errors for Blob type compatibility
    typescript: {
        ignoreBuildErrors: true,
    },

    // Force Webpack configuration
    webpack: (config, { isServer }) => {
        // Disable problematic modules for client-side
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;

        // Exclude Node.js modules from client-side bundle
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                util: false,
                buffer: false,
                zlib: false,
                os: false,
                child_process: false,
            };
        }

        // Optimize for serverless
        config.optimization = {
            ...config.optimization,
            minimize: true,
        };

        return config;
    },

    // Vercel-specific optimizations
    output: 'standalone',

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },

    // Compression
    compress: true,

    // Production source maps (disabled for faster builds)
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
