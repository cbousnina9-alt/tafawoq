'use client';
import { useEffect, useRef, useState } from 'react';

/** يعرض صفحات PDF كصور داخل الصفحة — يعمل على كل الهواتف */
export default function PdfViewer({ src, title, labels, all }: { src: string; title: string; labels: { loading: string; error: string; more: string }; all?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(all ? 99 : 3);
  const docRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
        const doc = await pdfjs.getDocument({ url: src, cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/standard_fonts/', wasmUrl: '/pdfjs/wasm/', useSystemFonts: false, disableFontFace: true }).promise;
        if (cancelled) return;
        docRef.current = doc;
        setTotal(doc.numPages);
        setState('ok');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const doc = docRef.current as { numPages: number; getPage: (n: number) => Promise<any> } | null;
    const el = box.current;
    if (!doc || !el) return;
    let cancelled = false;
    (async () => {
      const width = el.clientWidth;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      for (let i = el.childElementCount + 1; i <= Math.min(limit, doc.numPages); i++) {
        const page = await doc.getPage(i);
        if (cancelled) return;
        const vp1 = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: (width / vp1.width) * ratio });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        canvas.style.width = '100%';
        canvas.setAttribute('aria-label', `${title} — ${i}`);
        canvas.setAttribute('role', 'img');
        el.appendChild(canvas);
        await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state, limit, title]);

  return (
    <div>
      {state === 'loading' && <div className="viewer-msg">{labels.loading}</div>}
      {state === 'error' && <div className="viewer-msg">{labels.error}</div>}
      <div ref={box} className="pdf-pages" />
      {state === 'ok' && total > limit && (
        <button className="btn btn-ghost" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => setLimit(total)}>
          {labels.more} ({total - limit})
        </button>
      )}
    </div>
  );
}
