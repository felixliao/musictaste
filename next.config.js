const { i18n } = require('./next-i18next.config')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  images: { domains: ['i.scdn.co'] },
  compiler: {
    removeConsole: {
      excludes: ['error'],
    },
  },
  i18n,
})
