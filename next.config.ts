import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'amseelcars.com/wp-content/uploads/' },
      { protocol: 'https', hostname: 'www.ignant.com' },
      { protocol: 'https', hostname: 'utfs.io' }, // Uploadthing CDN
    ]
  },
  // Turbopack configuration to handle Uploadthing
  // Using 'turbopack' (not 'experimental.turbo') for Next.js 15+
  // Reference: https://nextjs.org/docs/15/app/api-reference/config/next-config-js/turbopack
  turbopack: {
    // Use resolveAlias to redirect problematic README.md files to empty module
    resolveAlias: {
      // Redirect the specific README.md that's causing issues
      // Using absolute path to ensure Turbopack can resolve it
      '@uploadthing/mime-types/README.md': path.join(__dirname, 'public', 'empty.js'),
    },
    // Configure rules to handle markdown files from uploadthing packages
    rules: {
      // Treat ALL markdown files as empty JavaScript modules to avoid "Unknown module type" errors
      // This catches README.md and other markdown files that Turbopack tries to process
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      // Specifically handle uploadthing markdown files with different patterns
      '**/@uploadthing/**/*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '**/node_modules/@uploadthing/**/*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
    // Include .cjs extension to resolve CommonJS modules from Uploadthing
    resolveExtensions: [
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.cjs', // Added for Uploadthing CommonJS modules
      '.mjs',
      '.json',
    ],
  },
  // Workaround for Turbopack module resolution issues
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Ignore markdown files from node_modules using IgnorePlugin
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.md$/,
        contextRegExp: /node_modules\/@uploadthing/,
      })
    );
    return config;
  },
};

export default nextConfig;
