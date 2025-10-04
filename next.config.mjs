/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages with Next.js Runtime (supports SSR + Dynamic Routes)
  // No 'output: export' - use standard Next.js build

  // Disable Image Optimization API (Cloudflare uses next-on-pages)
  images: {
    unoptimized: true,
  },

  // Disable ESLint during production build to speed up deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript type checking during build (still checked in dev)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable static page generation errors (allow dynamic routes)
  // This prevents build failures when API routes use dynamic features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Skip static optimization for all API routes
  // Force all pages to be server-rendered
  // This is required for Cloudflare Pages deployment
  output: undefined, // No static export
};

export default nextConfig;
