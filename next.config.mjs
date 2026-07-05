/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Keep deploys from failing on lint warnings; run `npm run lint` locally if you want to check.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
