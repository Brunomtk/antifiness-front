/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/admin/dashboard/string', destination: '/admin/dashboard', permanent: false },
    ];
  },
}

export default nextConfig
