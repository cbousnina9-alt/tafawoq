'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// سياسة AdSense: لا إعلانات في الصفحات التي ليس فيها محتوى للناشر
// (نماذج الإرسال، البحث، المفضلة، الاتصال، صفحات الخطأ).
const NO_ADS = /^\/(ar|fr|en)\/(upload|search|favorites|contact)(\/|$)/;

export default function AdsScript({ client }: { client: string }) {
  const pathname = usePathname() || '';
  useEffect(() => {
    if (!client || NO_ADS.test(pathname)) return;
    if (document.querySelector('[data-no-ads]')) return;
    if (document.getElementById('adsbygoogle-js')) return;
    const s = document.createElement('script');
    s.id = 'adsbygoogle-js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    document.head.appendChild(s);
  }, [client, pathname]);
  return null;
}
