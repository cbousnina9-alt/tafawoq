export const dynamic = 'force-static';
import type { MetadataRoute } from 'next';
import { abs } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/*/search', '/*/favorites', '/api/', '/admin/'] }],
    sitemap: abs('/sitemap.xml'),
  };
}
