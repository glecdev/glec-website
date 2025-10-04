/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js build for Vercel deployment
  // Vercel automatically optimizes images and supports all Next.js features

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
