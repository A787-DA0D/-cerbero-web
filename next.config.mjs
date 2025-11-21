/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/coming-soon',
        permanent: false, // quando il sito è pronto lo togliamo
      },
    ];
  },
};

export default nextConfig;
