import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: routing.locales.flatMap((locale) => [
        {
          source: `/sitemap-pages-${locale}.xml`,
          destination: `/sitemaps-data/pages/${locale}`,
        },
        {
          source: `/sitemap-blog-${locale}.xml`,
          destination: `/sitemaps-data/blog/${locale}`,
        },
      ]),
    };
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "amseelcars.com" }],
        destination: "https://www.amseelcars.com/:path*",
        permanent: true,
      },
      // Legacy EN home URL -> canonical prefixed locale root.
      { source: "/home", destination: "/en", permanent: true },
      // FR listing path rename: /vehicules is not used for EN; safe 301 to canonical /voitures.
      { source: "/vehicules", destination: "/voitures", permanent: true },
      {
        source: "/vehicules/:path*",
        destination: "/voitures/:path*",
        permanent: true,
      },
      // Note: do not 301 /cars → /voitures — /cars is the English canonical URL (pair with /voitures via hreflang).
      // Legacy monolithic sitemaps → index (per-locale lives at sitemap-pages-{locale}.xml).
      {
        source: "/sitemap-pages.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/sitemap-blog.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
    ];
  },
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

export default withNextIntl(nextConfig);
