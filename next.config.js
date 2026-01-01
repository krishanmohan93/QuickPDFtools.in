/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add empty turbopack config to silence the warning
    turbopack: {},

    webpack: (config, { isServer }) => {
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
            };
        }

        return config;
    },
};

module.exports = nextConfig;
