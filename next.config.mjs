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

  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://glec-website.vercel.app https://*.neon.tech wss://glec-website.vercel.app",
              "frame-ancestors 'none'",
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
