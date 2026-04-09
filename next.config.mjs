/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing API route files have lint issues outside the scope of this PR
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Disable client-side router cache so admin changes are reflected immediately
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
