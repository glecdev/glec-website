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
};

export default nextConfig;
