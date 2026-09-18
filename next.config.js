/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: true, // o false si prefieres una redirección temporal
      },
    ];
  },
};

export default nextConfig; // O usa module.exports = nextConfig si tu proyecto usa CommonJS