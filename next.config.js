/** @type {import('next').NextConfig} */

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com http://unpkg.com https://cdnjs.cloudflare.com https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://www.youtube.com https://s.ytimg.com https://apis.google.com https://*.firebaseapp.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https: https://www.googletagmanager.com https://*.google-analytics.com https://i.ytimg.com https://*.public.blob.vercel-storage.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com https://docs.google.com https://drive.google.com https://apis.google.com https://*.firebaseapp.com;
  child-src 'self' blob: https://unpkg.com http://unpkg.com https://www.youtube.com https://www.youtube-nocookie.com https://docs.google.com https://drive.google.com https://apis.google.com https://*.firebaseapp.com;
  worker-src 'self' blob: https://unpkg.com http://unpkg.com;
  connect-src 'self' data: blob: https://public.blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://unpkg.com http://unpkg.com https://cdnjs.cloudflare.com https://*.challenges.cloudflare.com https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.firebase-vh.googleusercontent.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firestore.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com;
`;

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
};

export default nextConfig;