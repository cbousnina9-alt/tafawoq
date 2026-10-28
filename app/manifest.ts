export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name.ar} — فروض واختبارات`,
    short_name: site.name.ar,
    description: 'فروض، اختبارات ودروس لكل المستويات مع الحلول',
    start_url: '/ar',
    display: 'standalone',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#f7f9f8',
    theme_color: '#15342a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
