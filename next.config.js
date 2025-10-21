/** @type {import('next').NextConfig} */

const path = require('path')

module.exports = {
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
