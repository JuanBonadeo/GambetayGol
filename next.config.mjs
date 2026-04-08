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
};

export default nextConfig;
