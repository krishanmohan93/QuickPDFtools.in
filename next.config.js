/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["pdfkit"],
    // Webpack configuration (Turbopack disabled by using --webpack flag)
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

        return config;
    },

    // TypeScript configuration
    typescript: {
        ignoreBuildErrors: true,
    },

    // Vercel optimizations
    output: 'standalone',

    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },

    compress: true,
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
