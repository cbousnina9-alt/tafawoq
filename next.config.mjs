/** @type {import('next').NextConfig} */
// STATIC_EXPORT=1 npm run build  → مجلد out/ جاهز للرفع على Netlify أو أي استضافة ملفات
const isExport = process.env.STATIC_EXPORT === '1';

const nextConfig = isExport
  ? { output: 'export', poweredByHeader: false, trailingSlash: false, images: { unoptimized: true } }
  : {
      poweredByHeader: false,
      trailingSlash: false,
      async redirects() {
        return [{ source: '/', destination: '/ar', permanent: true }];
      },
      async headers() {
        return [
          { source: '/files/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
          { source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] },
        ];
      },
    };
export default nextConfig;
