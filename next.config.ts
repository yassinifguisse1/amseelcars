import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-DNS-Prefetch-Control", value: "on" }],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'amseelcars.com' },
      { protocol: 'https', hostname: 'www.amseelcars.com' },
      { protocol: 'https', hostname: 'www.ignant.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '**.ufs.sh' },
    ]
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "gsap",
      "@react-google-maps/api",
    ],
    /** Inline CSS into HTML to cut render-blocking stylesheet waterfalls (Tailwind + modules). */
    inlineCss: true,
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
      // Drop Next's unconditional modern polyfill bundle (~11 KiB Lighthouse "Legacy JS").
      '../build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
      'next/dist/build/polyfills/polyfill-module': './src/lib/empty-polyfill.js',
      'next/dist/build/polyfills/polyfill-module.js': './src/lib/empty-polyfill.js',
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
    config.resolve.alias = {
      ...config.resolve.alias,
      // Drop Next's unconditional modern polyfill bundle (~11 KiB Lighthouse "Legacy JS").
      "../build/polyfills/polyfill-module": false,
      "next/dist/build/polyfills/polyfill-module": false,
      "next/dist/build/polyfills/polyfill-module.js": false,
    };
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
