import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'amseelcars.com/wp-content/uploads/' },
      { protocol: 'https', hostname: 'www.ignant.com' }
    ]
  }
};

export default nextConfig;
