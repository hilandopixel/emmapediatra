/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: false, // Ponlo en true cuando estés 100% seguro de que funciona
      },
    ];
  },
};

module.exports = nextConfig;