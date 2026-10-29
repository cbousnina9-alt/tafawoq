// شعار تفوّق: كتاب مفتوح تعلوه نجمة التفوّق
export default function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="logo-svg">
      <rect width="40" height="40" rx="11" fill="#2f4be0" />
      <path d="M8.5 15.5c4-1.6 7.8-1.4 11.5.9v14.3c-3.7-2.3-7.5-2.5-11.5-.9Z" fill="#fff" />
      <path d="M31.5 15.5c-4-1.6-7.8-1.4-11.5.9v14.3c3.7-2.3 7.5-2.5 11.5-.9Z" fill="#dfe5ff" />
      <path d="m20 5.2 1.7 3.5 3.8.5-2.8 2.6.7 3.8L20 13.8l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5Z" fill="#ffe45c" />
    </svg>
  );
}
