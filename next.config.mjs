/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Required for Electron: allow loading from file:// protocol in production
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
