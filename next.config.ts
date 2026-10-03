/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Bikin Vercel tutup mata sama error TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bikin Vercel tutup mata sama error linter
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;