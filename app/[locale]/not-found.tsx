import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="board">
      <div className="wrap page-head" style={{ padding: '60px 16px' }}>
        <h1>الصفحة غير موجودة — Page introuvable</h1>
        <p>ربما تغيّر الرابط أو حُذف الملف. ابدأ من الصفحة الرئيسية أو استعمل البحث.</p>
        <p style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <Link className="btn btn-primary" href="/ar">الرئيسية</Link>
          <Link className="btn btn-ghost" href="/ar/search">بحث</Link>
        </p>
      </div>
    </section>
  );
}
