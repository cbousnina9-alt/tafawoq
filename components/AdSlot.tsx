'use client';
import { useEffect, useRef } from 'react';
import { site } from '@/lib/site';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

type Pos = keyof typeof site.adSlots;

/**
 * وحدة إعلانية من Google AdSense.
 * قبل القبول في AdSense (أو بدون رقم الوحدة) يظهر مكان فارغ في وضع التطوير فقط.
 */
export default function AdSlot({ pos, format = 'auto' }: { pos: Pos; format?: 'auto' | 'rectangle' | 'horizontal' }) {
  const ref = useRef<HTMLModElement>(null);
  const slot = site.adSlots[pos];
  const client = site.adsenseClient;

  useEffect(() => {
    if (!client || !slot || !ref.current || ref.current.dataset.loaded) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      ref.current.dataset.loaded = '1';
    } catch {}
  }, [client, slot]);

  if (!client || !slot) {
    if (process.env.NODE_ENV !== 'production') return <div className="ad-placeholder">AdSense · {pos}</div>;
    return null;
  }
  return (
    <div className="ad">
      <span className="ad-label">إعلان</span>
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }} data-ad-client={client} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  );
}
