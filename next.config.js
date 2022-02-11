/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: { domains: ['i.scdn.co'] },
  compiler: {
    removeConsole: {
      excludes: ['error'],
    },
  },
}
