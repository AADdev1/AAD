/** @type {import('next').NextConfig} */

const path = require('path')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disable ESLint on Vercel build
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/product',
        destination: '/products',
        permanent: true,
      },
    ]
  },

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  },
}

module.exports = nextConfig
