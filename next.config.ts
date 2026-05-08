import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/products", destination: "/boxes/products", permanent: true },
      { source: "/products/:path*", destination: "/boxes/products/:path*", permanent: true },
      { source: "/about", destination: "/boxes/about", permanent: true },
      { source: "/contact", destination: "/boxes/contact", permanent: true },
      { source: "/papers", destination: "/papers/home", permanent: true },
      { source: "/papers/home/products", destination: "/papers/products", permanent: true },
      { source: "/papers/home/about", destination: "/papers/about", permanent: true },
      { source: "/papers/home/contact", destination: "/papers/contact", permanent: true },
      { source: "/papers/home/quote", destination: "/papers/contact", permanent: true },
      {
        source: "/papers/home/product/:slug",
        destination: "/papers/product/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER]
      }
    }
  }
};

export default nextConfig;
// Orchids restart: 1771275792004
