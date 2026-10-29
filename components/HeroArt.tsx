// رسم الواجهة: ورقة اختبار مصحّحة بختم 20/20 وأيقونات مواد
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 440 380" role="img" aria-label="ورقة اختبار مصححة">
      <defs>
        <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1a2233" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* الورقة الخلفية */}
      <g transform="rotate(-7 220 190)">
        <rect x="92" y="42" width="250" height="310" rx="14" fill="#dfe5ff" />
      </g>
      {/* ورقة الاختبار */}
      <g transform="rotate(3 220 190)" filter="url(#sh)">
        <rect x="88" y="30" width="260" height="320" rx="14" fill="#fff" />
        <rect x="112" y="56" width="212" height="30" rx="8" fill="#eceffd" />
        <text x="218" y="76" textAnchor="middle" direction="rtl" fontSize="14" fontWeight="700" fill="#2f4be0" fontFamily="IBM Plex Sans Arabic, sans-serif">اختبار الفصل الأول</text>
        {[110, 172, 234].map((y, i) => (
          <g key={y}>
            <rect x="268" y={y} width="56" height="10" rx="5" fill="#1a2233" opacity="0.85" />
            <rect x="140" y={y + 22} width="184" height="7" rx="3.5" fill="#e2e6ee" />
            <rect x={i === 1 ? 180 : 160} y={y + 38} width={i === 1 ? 144 : 164} height="7" rx="3.5" fill="#e2e6ee" />
            <path d={`M118 ${y + 26} l6 6 l11 -13`} fill="none" stroke="#2f4be0" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        <rect x="112" y="300" width="96" height="8" rx="4" fill="#e2e6ee" />
      </g>
      {/* ختم 20/20 */}
      <g transform="rotate(-12 116 300)">
        <circle cx="116" cy="300" r="44" fill="#fff" stroke="#d3362c" strokeWidth="3.5" />
        <circle cx="116" cy="300" r="36" fill="none" stroke="#d3362c" strokeWidth="1.5" strokeDasharray="3 4" />
        <text x="116" y="309" textAnchor="middle" fontSize="25" fontWeight="800" fill="#d3362c" fontFamily="IBM Plex Sans Arabic, sans-serif">20/20</text>
      </g>
      {/* شارات المواد */}
      <g transform="translate(362 64)">
        <circle r="30" fill="#fff" filter="url(#sh)" />
        <path d="M8 -11H-7l7.5 11L-7 11H8" fill="none" stroke="#2f4be0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(392 196)">
        <circle r="26" fill="#fff" filter="url(#sh)" />
        <g fill="none" stroke="#7c3aed" strokeWidth="2.2">
          <ellipse rx="15" ry="6" />
          <ellipse rx="15" ry="6" transform="rotate(60)" />
          <ellipse rx="15" ry="6" transform="rotate(120)" />
        </g>
        <circle r="2.6" fill="#7c3aed" />
      </g>
      <g transform="translate(372 318)">
        <circle r="24" fill="#ffe45c" />
        <text y="8" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a2233" fontFamily="IBM Plex Sans Arabic, sans-serif">ض</text>
      </g>
      <g transform="translate(58 112)">
        <circle r="24" fill="#fff" filter="url(#sh)" />
        <path d="M-1 9A8 8 0 0 1 -2.4 -6.9C4 -8 5.8 -8.6 8 -11.5c1.1 2.3 2.3 4.8 2.3 9.2 0 6.3-5.5 11.5-11.4 11.5Z" fill="none" stroke="#15803d" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
