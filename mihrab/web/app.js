/* مِحراب — مواقيت الصلاة، الأذان، المصحف، القبلة */
(() => {
'use strict';

const A = window.adhan;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const AR = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).replace(/\d/g, (d) => AR[d]);
const pad = (n) => String(n).padStart(2, '0');

/* ---------- storage ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('mihrab:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('mihrab:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

/* ---------- reference data ---------- */
const PRAYERS = [
  { key: 'fajr', name: 'الفجر' },
  { key: 'sunrise', name: 'الشروق', noAdhan: true },
  { key: 'dhuhr', name: 'الظهر' },
  { key: 'asr', name: 'العصر' },
  { key: 'maghrib', name: 'المغرب' },
  { key: 'isha', name: 'العشاء' },
];
const FARD = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const ICONS = {
  fajr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 18h18M7 18a5 5 0 0 1 10 0"/><path d="M12 4v3M5.6 9.6l1.4 1.4M18.4 9.6 17 11"/></svg>',
  sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 19h18M6 19a6 6 0 0 1 12 0"/><path d="M12 3v4M9.5 5.5 12 3l2.5 2.5"/></svg>',
  dhuhr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  asr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="14" cy="10" r="3.5"/><path d="M14 3v1.5M20 10h1.5M18.6 5.4l-1 1M3 20h18M5 16h8"/></svg>',
  maghrib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 17h18M7 17a5 5 0 0 1 10 0M5 21h14"/><path d="M12 7V4M9.5 5.5 12 8l2.5-2.5"/></svg>',
  isha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/><path d="M17 4l.6 1.4L19 6l-1.4.6L17 8l-.6-1.4L15 6l1.4-.6z"/></svg>',
};
const I = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  bellOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  bellOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.7 3.9A6 6 0 0 1 18 8c0 3 .5 5 1.2 6.4M17 17H3s3-2 3-9c0-.6.1-1.2.2-1.7"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0M2 2l20 20"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.6-4.7-2-8-2v14c3.3 0 6 .4 8 2 2-1.6 4.7-2 8-2V4c-3.3 0-6 .4-8 2z"/><path d="M12 6v14"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  chevDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  bellFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" fill="none"/></svg>',
  coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="9" cy="7" rx="6" ry="2.5"/><path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7M3 11v4c0 1.4 2.7 2.5 6 2.5 1 0 2-.1 2.8-.3"/><circle cx="17" cy="16" r="4.5"/></svg>',
  markFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  skipNext: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6.5v11a1 1 0 0 0 1.5.86l8.5-5.5a1 1 0 0 0 0-1.72L7.5 5.64A1 1 0 0 0 6 6.5z"/><rect x="17" y="6" width="2.4" height="12" rx="1"/></svg>',
  skipPrev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 6.5v11a1 1 0 0 1-1.5.86L8 12.86a1 1 0 0 1 0-1.72l8.5-5.5A1 1 0 0 1 18 6.5z"/><rect x="4.6" y="6" width="2.4" height="12" rx="1"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.7"/><path d="M4 4v4.7h4.7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/></svg>',
  kaaba: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 8l8-4 8 4v10l-8 3-8-3z"/><path d="M4 8l8 3 8-3M12 11v10M4 12l8 3 8-3"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.6-.9 1.2-1.8-.5-1.1.2-2.2 1.4-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/></svg>',
  headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  vibrate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="4" width="8" height="16" rx="1.6"/><path d="M4 9v6M2 10.5v3M20 9v6M22 10.5v3"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  gps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
};

// [name, country, lat, lng, timezone, method]
const CITIES = [
  ['الجزائر العاصمة', 'الجزائر', 36.7538, 3.0588, 'Africa/Algiers', 'algeria'],
  ['وهران', 'الجزائر', 35.6971, -0.6308, 'Africa/Algiers', 'algeria'],
  ['قسنطينة', 'الجزائر', 36.3650, 6.6147, 'Africa/Algiers', 'algeria'],
  ['عنابة', 'الجزائر', 36.9000, 7.7667, 'Africa/Algiers', 'algeria'],
  ['البليدة', 'الجزائر', 36.4700, 2.8277, 'Africa/Algiers', 'algeria'],
  ['سطيف', 'الجزائر', 36.1911, 5.4137, 'Africa/Algiers', 'algeria'],
  ['باتنة', 'الجزائر', 35.5559, 6.1741, 'Africa/Algiers', 'algeria'],
  ['تلمسان', 'الجزائر', 34.8783, -1.3150, 'Africa/Algiers', 'algeria'],
  ['بجاية', 'الجزائر', 36.7509, 5.0567, 'Africa/Algiers', 'algeria'],
  ['تيزي وزو', 'الجزائر', 36.7118, 4.0459, 'Africa/Algiers', 'algeria'],
  ['بسكرة', 'الجزائر', 34.8500, 5.7333, 'Africa/Algiers', 'algeria'],
  ['الجلفة', 'الجزائر', 34.6728, 3.2630, 'Africa/Algiers', 'algeria'],
  ['ورقلة', 'الجزائر', 31.9539, 5.3252, 'Africa/Algiers', 'algeria'],
  ['غرداية', 'الجزائر', 32.4909, 3.6735, 'Africa/Algiers', 'algeria'],
  ['الوادي', 'الجزائر', 33.3683, 6.8674, 'Africa/Algiers', 'algeria'],
  ['بشار', 'الجزائر', 31.6238, -2.2162, 'Africa/Algiers', 'algeria'],
  ['أدرار', 'الجزائر', 27.8743, -0.2939, 'Africa/Algiers', 'algeria'],
  ['تمنراست', 'الجزائر', 22.7850, 5.5228, 'Africa/Algiers', 'algeria'],
  ['الشلف', 'الجزائر', 36.1650, 1.3345, 'Africa/Algiers', 'algeria'],
  ['مستغانم', 'الجزائر', 35.9311, 0.0892, 'Africa/Algiers', 'algeria'],
  ['سكيكدة', 'الجزائر', 36.8762, 6.9092, 'Africa/Algiers', 'algeria'],
  ['جيجل', 'الجزائر', 36.8200, 5.7667, 'Africa/Algiers', 'algeria'],
  ['المسيلة', 'الجزائر', 35.7058, 4.5419, 'Africa/Algiers', 'algeria'],
  ['تبسة', 'الجزائر', 35.4040, 8.1242, 'Africa/Algiers', 'algeria'],
  ['سيدي بلعباس', 'الجزائر', 35.1899, -0.6308, 'Africa/Algiers', 'algeria'],
  ['تيارت', 'الجزائر', 35.3711, 1.3170, 'Africa/Algiers', 'algeria'],
  ['الأغواط', 'الجزائر', 33.8000, 2.8650, 'Africa/Algiers', 'algeria'],
  ['البويرة', 'الجزائر', 36.3749, 3.9020, 'Africa/Algiers', 'algeria'],
  ['المدية', 'الجزائر', 36.2642, 2.7539, 'Africa/Algiers', 'algeria'],
  ['بومرداس', 'الجزائر', 36.7664, 3.4772, 'Africa/Algiers', 'algeria'],
  ['تونس', 'تونس', 36.8065, 10.1815, 'Africa/Tunis', 'tunisia'],
  ['صفاقس', 'تونس', 34.7406, 10.7603, 'Africa/Tunis', 'tunisia'],
  ['سوسة', 'تونس', 35.8256, 10.6360, 'Africa/Tunis', 'tunisia'],
  ['الرباط', 'المغرب', 34.0209, -6.8416, 'Africa/Casablanca', 'morocco'],
  ['الدار البيضاء', 'المغرب', 33.5731, -7.5898, 'Africa/Casablanca', 'morocco'],
  ['مراكش', 'المغرب', 31.6295, -7.9811, 'Africa/Casablanca', 'morocco'],
  ['فاس', 'المغرب', 34.0181, -5.0078, 'Africa/Casablanca', 'morocco'],
  ['طنجة', 'المغرب', 35.7595, -5.8340, 'Africa/Casablanca', 'morocco'],
  ['طرابلس', 'ليبيا', 32.8872, 13.1913, 'Africa/Tripoli', 'egypt'],
  ['بنغازي', 'ليبيا', 32.1167, 20.0667, 'Africa/Tripoli', 'egypt'],
  ['القاهرة', 'مصر', 30.0444, 31.2357, 'Africa/Cairo', 'egypt'],
  ['الإسكندرية', 'مصر', 31.2001, 29.9187, 'Africa/Cairo', 'egypt'],
  ['نواكشوط', 'موريتانيا', 18.0735, -15.9582, 'Africa/Nouakchott', 'mwl'],
  ['الخرطوم', 'السودان', 15.5007, 32.5599, 'Africa/Khartoum', 'egypt'],
  ['مكة المكرمة', 'السعودية', 21.3891, 39.8579, 'Asia/Riyadh', 'ummalqura'],
  ['المدينة المنورة', 'السعودية', 24.5247, 39.5692, 'Asia/Riyadh', 'ummalqura'],
  ['الرياض', 'السعودية', 24.7136, 46.6753, 'Asia/Riyadh', 'ummalqura'],
  ['جدة', 'السعودية', 21.4858, 39.1925, 'Asia/Riyadh', 'ummalqura'],
  ['الدمام', 'السعودية', 26.4207, 50.0888, 'Asia/Riyadh', 'ummalqura'],
  ['دبي', 'الإمارات', 25.2048, 55.2708, 'Asia/Dubai', 'dubai'],
  ['أبوظبي', 'الإمارات', 24.4539, 54.3773, 'Asia/Dubai', 'dubai'],
  ['الدوحة', 'قطر', 25.2854, 51.5310, 'Asia/Qatar', 'qatar'],
  ['الكويت', 'الكويت', 29.3759, 47.9774, 'Asia/Kuwait', 'kuwait'],
  ['المنامة', 'البحرين', 26.2285, 50.5860, 'Asia/Bahrain', 'mwl'],
  ['مسقط', 'عُمان', 23.5880, 58.3829, 'Asia/Muscat', 'mwl'],
  ['عمّان', 'الأردن', 31.9454, 35.9284, 'Asia/Amman', 'mwl'],
  ['القدس', 'فلسطين', 31.7683, 35.2137, 'Asia/Jerusalem', 'mwl'],
  ['غزة', 'فلسطين', 31.5017, 34.4668, 'Asia/Gaza', 'mwl'],
  ['بيروت', 'لبنان', 33.8938, 35.5018, 'Asia/Beirut', 'mwl'],
  ['دمشق', 'سوريا', 33.5138, 36.2765, 'Asia/Damascus', 'mwl'],
  ['بغداد', 'العراق', 33.3152, 44.3661, 'Asia/Baghdad', 'mwl'],
  ['صنعاء', 'اليمن', 15.3694, 44.1910, 'Asia/Aden', 'mwl'],
  ['إسطنبول', 'تركيا', 41.0082, 28.9784, 'Europe/Istanbul', 'turkey'],
  ['باريس', 'فرنسا', 48.8566, 2.3522, 'Europe/Paris', 'france'],
  ['مرسيليا', 'فرنسا', 43.2965, 5.3698, 'Europe/Paris', 'france'],
  ['ليون', 'فرنسا', 45.7640, 4.8357, 'Europe/Paris', 'france'],
  ['بروكسل', 'بلجيكا', 50.8503, 4.3517, 'Europe/Brussels', 'mwl'],
  ['لندن', 'بريطانيا', 51.5072, -0.1276, 'Europe/London', 'mwl'],
  ['برلين', 'ألمانيا', 52.5200, 13.4050, 'Europe/Berlin', 'mwl'],
  ['مدريد', 'إسبانيا', 40.4168, -3.7038, 'Europe/Madrid', 'mwl'],
  ['روما', 'إيطاليا', 41.9028, 12.4964, 'Europe/Rome', 'mwl'],
  ['مونتريال', 'كندا', 45.5019, -73.5674, 'America/Toronto', 'isna'],
  ['تورونتو', 'كندا', 43.6532, -79.3832, 'America/Toronto', 'isna'],
  ['نيويورك', 'الولايات المتحدة', 40.7128, -74.0060, 'America/New_York', 'isna'],
  ['كوالالمبور', 'ماليزيا', 3.1390, 101.6869, 'Asia/Kuala_Lumpur', 'singapore'],
  ['جاكرتا', 'إندونيسيا', -6.2088, 106.8456, 'Asia/Jakarta', 'singapore'],
  ['كراتشي', 'باكستان', 24.8607, 67.0011, 'Asia/Karachi', 'karachi'],
];

const custom = (fajr, isha) => () => { const p = A.CalculationMethod.Other(); p.fajrAngle = fajr; p.ishaAngle = isha; return p; };
const METHODS = {
  algeria: { label: 'الجزائر — وزارة الشؤون الدينية (18° / 17°)', make: custom(18, 17) },
  mwl: { label: 'رابطة العالم الإسلامي (18° / 17°)', make: () => A.CalculationMethod.MuslimWorldLeague() },
  egypt: { label: 'الهيئة المصرية العامة للمساحة (19.5° / 17.5°)', make: () => A.CalculationMethod.Egyptian() },
  ummalqura: { label: 'أم القرى — مكة المكرمة', make: () => A.CalculationMethod.UmmAlQura() },
  morocco: { label: 'المغرب — وزارة الأوقاف (19° / 17°)', make: custom(19, 17) },
  tunisia: { label: 'تونس (18° / 18°)', make: custom(18, 18) },
  dubai: { label: 'دبي (18.2° / 18.2°)', make: () => A.CalculationMethod.Dubai() },
  qatar: { label: 'قطر', make: () => A.CalculationMethod.Qatar() },
  kuwait: { label: 'الكويت (18° / 17.5°)', make: () => A.CalculationMethod.Kuwait() },
  karachi: { label: 'جامعة العلوم الإسلامية، كراتشي', make: () => A.CalculationMethod.Karachi() },
  turkey: { label: 'تركيا — رئاسة الشؤون الدينية', make: () => A.CalculationMethod.Turkey() },
  france: { label: 'فرنسا — اتحاد المنظمات (12° / 12°)', make: custom(12, 12) },
  isna: { label: 'أمريكا الشمالية ISNA (15° / 15°)', make: () => A.CalculationMethod.NorthAmerica() },
  moonsighting: { label: 'لجنة رؤية الهلال', make: () => A.CalculationMethod.MoonsightingCommittee() },
  singapore: { label: 'سنغافورة / ماليزيا / إندونيسيا', make: () => A.CalculationMethod.Singapore() },
  tehran: { label: 'معهد الجيوفيزياء، طهران', make: () => A.CalculationMethod.Tehran() },
};

const RECITERS = [
  ['ar.alafasy', 'مشاري راشد العفاسي', 128],
  ['ar.husary', 'محمود خليل الحصري', 128],
  ['ar.minshawi', 'محمد صديق المنشاوي', 128],
  ['ar.abdulbasitmurattal', 'عبد الباسط عبد الصمد', 192],
  ['ar.mahermuaiqly', 'ماهر المعيقلي', 128],
  ['ar.abdurrahmaansudais', 'عبد الرحمن السديس', 192],
  ['ar.saoodshuraym', 'سعود الشريم', 64],
  ['ar.hudhaify', 'علي الحذيفي', 128],
  ['ar.muhammadayyoub', 'محمد أيوب', 128],
  ['ar.ahmedajamy', 'أحمد بن علي العجمي', 128],
];

// First ayah of each juz' [surah, ayah]
const JUZ = [[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
const JUZ_NAMES = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];
const SOUNDS = [
  ['adhan1', 'الأذان الأول'],
  ['adhan2', 'الأذان الثاني (أقصر)'],
  ['tone', 'نغمة هادئة'],
  ['file', 'تسجيل من جهازي'],
  ['silent', 'بدون صوت'],
];
const SOUND_FILES = { adhan1: 'audio/adhan-1.mp3', adhan2: 'audio/adhan-2.mp3' };
const KAABA = { lat: 21.422487, lng: 39.826206 };

/* ---------- settings ---------- */
const deviceTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } })();
const DEFAULTS = {
  loc: null, method: 'algeria', methodManual: false, madhab: 'shafi', highLat: 'auto',
  offsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  hijriAdj: 0, h24: true,
  adhan: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reminder: 0, sound: 'adhan1', soundName: '', remindMorning: true, remindEvening: true, reciter: 'ar.alafasy', qsize: 28, theme: 'auto',
};
const S = Object.assign({}, DEFAULTS, LS.get('settings', {}));
S.offsets = Object.assign({}, DEFAULTS.offsets, S.offsets || {});
S.adhan = Object.assign({}, DEFAULTS.adhan, S.adhan || {});
if (!S.v2) { if (S.sound === 'tone') S.sound = 'adhan1'; S.v2 = true; }
if (!S.loc) {
  const byTz = CITIES.find((c) => c[4] === deviceTz) || CITIES[0];
  S.loc = { lat: byTz[2], lng: byTz[3], name: byTz[0], country: byTz[1], tz: byTz[4], auto: true };
  S.method = byTz[5];
}
if (!METHODS[S.method]) S.method = 'mwl';
const NATIVE = window.MihrabNative || null;
const save = () => { LS.set('settings', S); invalidate(); pushNativeSchedule(); };

/* ---------- prayer time engine ---------- */
let cache = {};
function invalidate() { cache = {}; }
function coords() { return new A.Coordinates(S.loc.lat, S.loc.lng); }
function params() {
  const p = METHODS[S.method].make();
  p.madhab = S.madhab === 'hanafi' ? A.Madhab.Hanafi : A.Madhab.Shafi;
  p.highLatitudeRule = S.highLat === 'auto' ? A.HighLatitudeRule.recommended(coords()) : S.highLat;
  for (const k of Object.keys(S.offsets)) p.adjustments[k] = (p.adjustments[k] || 0) + (Number(S.offsets[k]) || 0);
  return p;
}
function ymd(date, tz) {
  const s = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}
function addDays(t, n) {
  const d = new Date(Date.UTC(t.y, t.m - 1, t.d + n));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}
const key = (t) => `${t.y}-${pad(t.m)}-${pad(t.d)}`;
function dayTimes(t) {
  const k = key(t);
  if (cache[k]) return cache[k];
  const pt = new A.PrayerTimes(coords(), new Date(t.y, t.m - 1, t.d, 12), params());
  const r = { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
  cache[k] = r;
  return r;
}
function state(now = new Date()) {
  const t = ymd(now, S.loc.tz);
  const today = dayTimes(t);
  let next = null;
  for (const k of FARD) if (today[k] > now) { next = { key: k, time: today[k] }; break; }
  if (!next) next = { key: 'fajr', time: dayTimes(addDays(t, 1)).fajr, tomorrow: true };
  let prev = null;
  for (const k of FARD) if (today[k] <= now) prev = { key: k, time: today[k] };
  if (!prev) prev = { key: 'isha', time: dayTimes(addDays(t, -1)).isha };
  return { t, today, next, prev, friday: isFriday(t) };
}
const isFriday = (t) => new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay() === 5;
const pName = (k, friday) => (k === 'dhuhr' && friday ? 'الجمعة' : PRAYERS.find((p) => p.key === k).name);

/* ---------- native alarms (Android app) ---------- */
function pushNativeSchedule() {
  if (!NATIVE) return;
  pushWidgetData();
  try {
    const now = Date.now(); const out = [];
    let t = ymd(new Date(), S.loc.tz);
    for (let i = 0; i < 30; i++, t = addDays(t, 1)) {
      const tt = dayTimes(t); const fri = isFriday(t);
      for (const k of FARD) {
        if (!S.adhan[k]) continue;
        const at = tt[k].getTime();
        if (at > now) out.push({ t: at, title: `حان وقت صلاة ${pName(k, fri)}`, body: `${fmtTime(tt[k])} · ${S.loc.name}`, adhan: true, sound: S.sound });
        if (S.reminder > 0) {
          const rt = at - S.reminder * 60000;
          if (rt > now) out.push({ t: rt, title: `بقي ${minutesWord(S.reminder)} على صلاة ${pName(k, fri)}`, body: `الأذان عند ${fmtTime(tt[k])}`, adhan: false });
        }
      }
    }
    let d = ymd(new Date(), S.loc.tz);
    for (let i = 0; i < 30; i++, d = addDays(d, 1)) {
      const tt = dayTimes(d);
      for (const r of adhkarReminders(tt)) if (r.t > now) out.push({ t: r.t, title: r.title, body: r.body, adhan: false, open: r.open });
    }
    out.sort((a, b) => a.t - b.t);
    NATIVE.schedule(JSON.stringify(out));
  } catch (e) { /* bridge unavailable */ }
}

function adhkarReminders(tt) {
  const out = [];
  if (S.remindMorning) out.push({ t: tt.fajr.getTime() + 25 * 60000, title: 'أذكار الصباح', body: 'حان وقت أذكار الصباح', open: 'morning', k: 'am' });
  if (S.remindEvening) out.push({ t: tt.asr.getTime() + 25 * 60000, title: 'أذكار المساء', body: 'حان وقت أذكار المساء', open: 'evening', k: 'pm' });
  return out;
}

/* ---------- formatting ---------- */
const fmtCache = {};
function fmt(kind, date) {
  const tz = S.loc.tz;
  const id = kind + tz + S.h24;
  if (!fmtCache[id]) {
    const o = { timeZone: tz };
    if (kind === 'time') Object.assign(o, { hour: '2-digit', minute: '2-digit', hourCycle: S.h24 ? 'h23' : 'h12' });
    if (kind === 'greg') Object.assign(o, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (kind === 'wd') Object.assign(o, { weekday: 'short' });
    if (kind === 'hijri') Object.assign(o, { day: 'numeric', month: 'long', year: 'numeric' });
    if (kind === 'hijriShort') Object.assign(o, { day: 'numeric', month: 'short' });
    const loc = kind.startsWith('hijri') ? 'ar-u-ca-islamic-umalqura-nu-latn' : 'ar-u-nu-latn';
    try { fmtCache[id] = new Intl.DateTimeFormat(loc, o); } catch (e) { fmtCache[id] = new Intl.DateTimeFormat('ar', o); }
  }
  let d = date;
  if (kind.startsWith('hijri') && S.hijriAdj) d = new Date(date.getTime() + S.hijriAdj * 864e5);
  return fmtCache[id].format(d);
}
const fmtTime = (d) => fmt('time', d);
function fmtLeft(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
function ayahWord(n) {
  if (n === 1) return 'آية واحدة';
  if (n === 2) return 'آيتان';
  if (n % 100 >= 3 && n % 100 <= 10) return `${arNum(n)} آيات`;
  return `${arNum(n)} آية`;
}
function minutesWord(n) {
  if (n === 1) return 'دقيقة';
  if (n === 2) return 'دقيقتان';
  if (n >= 3 && n <= 10) return `${n} دقائق`;
  return `${n} دقيقة`;
}

/* ---------- geo ---------- */
const rad = (d) => (d * Math.PI) / 180;
function distKm(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function nearestCity(lat, lng) {
  let best = null;
  for (const c of CITIES) {
    const d = distKm({ lat, lng }, { lat: c[2], lng: c[3] });
    if (!best || d < best.d) best = { c, d };
  }
  return best;
}
const qiblaBearing = () => A.Qibla(coords());

/* ---------- ui helpers ---------- */
const app = $('#app');
function toast(msg, ms = 2600) {
  const old = $('.toast'); if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}
function sheet(html, onMount) {
  closeSheet();
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeSheet(); });
  document.body.appendChild(scrim);
  if (onMount) onMount(scrim.firstElementChild);
  const f = scrim.querySelector('button, input, select'); if (f) f.focus({ preventScroll: true });
  return scrim.firstElementChild;
}
function closeSheet() { const s = $('.scrim'); if (s) s.remove(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSheet(); } });

function syncBars() {
  if (!NATIVE || !NATIVE.setBars) return;
  const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  try { NATIVE.setBars(dark); } catch (e) { /* ignore */ }
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => syncBars()); } catch (e) { /* old engines */ }
function applyTheme() {
  syncBars();
  const root = document.documentElement;
  if (S.theme === 'auto') { if (root.dataset.mihrabTheme) { root.removeAttribute('data-theme'); delete root.dataset.mihrabTheme; } }
  else { root.setAttribute('data-theme', S.theme); root.dataset.mihrabTheme = '1'; }
  root.style.setProperty('--quran-size', S.qsize + 'px');
}

/* ---------- audio: adhan ---------- */
let actx = null;
function ctx() {
  if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (C) actx = new C(); }
  return actx;
}
let audioArmed = false;
function arm() {
  if (audioArmed) return;
  audioArmed = true;
  try { const c = ctx(); if (c && c.state === 'suspended') c.resume(); } catch (e) { /* ignore */ }
  const b = $('#armBanner'); if (b) b.remove();
}
document.addEventListener('pointerdown', arm, { passive: true });
document.addEventListener('keydown', arm);

let adhanStop = null;
function synthAdhan() {
  const c = ctx(); if (!c) return () => {};
  if (c.state === 'suspended') c.resume();
  const t0 = c.currentTime + 0.05;
  const out = c.createGain(); out.gain.value = 0.0001;
  const delay = c.createDelay(); delay.delayTime.value = 0.23;
  const fb = c.createGain(); fb.gain.value = 0.28;
  const wet = c.createGain(); wet.gain.value = 0.35;
  out.connect(c.destination); out.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(c.destination);
  const osc = c.createOscillator(); osc.type = 'sine';
  const osc2 = c.createOscillator(); osc2.type = 'triangle';
  const g2 = c.createGain(); g2.gain.value = 0.18;
  const lfo = c.createOscillator(); lfo.frequency.value = 5.2;
  const lfoG = c.createGain(); lfoG.gain.value = 3.5;
  lfo.connect(lfoG); lfoG.connect(osc.frequency); lfoG.connect(osc2.frequency);
  osc.connect(out); osc2.connect(g2); g2.connect(out);
  // A melismatic phrase on maqam hijaz (D): notes in Hz with durations in seconds
  const D4 = 293.66, Eb4 = 311.13, Fs4 = 369.99, G4 = 392, A4 = 440, Bb4 = 466.16, C5 = 523.25, D5 = 587.33;
  const phrases = [
    [[A4, .55], [A4, .45], [Bb4, .4], [A4, .5], [G4, .35], [A4, 1.6]],
    [[A4, .4], [Bb4, .4], [C5, .45], [D5, .9], [C5, .35], [Bb4, .35], [A4, 1.7]],
    [[G4, .4], [A4, .4], [Bb4, .5], [A4, .35], [G4, .35], [Fs4, .4], [Eb4, .45], [D4, 2.2]],
  ];
  let t = t0;
  for (const ph of phrases) {
    out.gain.setTargetAtTime(0.32, t, 0.08);
    for (const [f, d] of ph) {
      osc.frequency.setTargetAtTime(f, t, 0.045);
      osc2.frequency.setTargetAtTime(f * 2, t, 0.045);
      t += d;
    }
    out.gain.setTargetAtTime(0.0001, t - 0.25, 0.18);
    t += 0.9;
  }
  osc.frequency.setValueAtTime(phrases[0][0][0], t0);
  osc2.frequency.setValueAtTime(phrases[0][0][0] * 2, t0);
  [osc, osc2, lfo].forEach((o) => { o.start(t0); o.stop(t + 0.5); });
  let stopped = false;
  const stop = () => {
    if (stopped) return; stopped = true;
    try { out.gain.cancelScheduledValues(c.currentTime); out.gain.setTargetAtTime(0.0001, c.currentTime, 0.05); [osc, osc2, lfo].forEach((o) => o.stop(c.currentTime + 0.3)); } catch (e) { /* already stopped */ }
  };
  osc.onended = () => { stopped = true; if (adhanStop === stop) adhanStop = null; };
  return stop;
}

// IndexedDB for a user-chosen adhan recording
function idb() {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open('mihrab', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
}
async function idbPut(k, v) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
async function idbGet(k) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readonly'); const q = tx.objectStore('files').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }

async function playAdhan() {
  stopAdhan();
  if (SOUND_FILES[S.sound]) {
    const au = new Audio(SOUND_FILES[S.sound]);
    au.play().catch(() => toast('المس الشاشة مرة ليُسمح بتشغيل صوت الأذان'));
    const stop = () => { au.pause(); au.currentTime = 0; };
    au.onended = () => { if (adhanStop === stop) adhanStop = null; };
    adhanStop = stop;
    return;
  }
  if (S.sound === 'file') {
    try {
      const blob = await idbGet('adhan');
      if (blob) {
        const url = URL.createObjectURL(blob);
        const au = new Audio(url);
        au.play().catch(() => toast('اضغط على الشاشة مرة ليُسمح بتشغيل صوت الأذان'));
        const stop = () => { au.pause(); URL.revokeObjectURL(url); };
        au.onended = () => { URL.revokeObjectURL(url); if (adhanStop === stop) adhanStop = null; };
        adhanStop = stop;
        return;
      }
    } catch (e) { /* fall back to tone */ }
  }
  if (S.sound === 'silent') return;
  adhanStop = synthAdhan();
}
function stopAdhan() { if (adhanStop) { adhanStop(); adhanStop = null; } if (NATIVE && NATIVE.stopAdhan) { try { NATIVE.stopAdhan(); } catch (e) { /* ignore */ } } }

async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'mihrab', renotify: true, vibrate: [300, 120, 300], lang: 'ar', dir: 'rtl' };
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg) { await reg.showNotification(title, opts); return; }
  } catch (e) { /* fall through */ }
  try { new Notification(title, opts); } catch (e) { /* unsupported */ }
}

function showAdhan(k, friday) {
  const old = $('.adhan-ov'); if (old) old.remove();
  const ov = document.createElement('div');
  ov.className = 'adhan-ov';
  ov.setAttribute('role', 'alertdialog');
  ov.innerHTML = `<div class="skyline">${skylineSvg()}</div>${starsSvg()}<div>
    <p>حان الآن موعد أذان</p>
    <div class="big">${esc(pName(k, friday))}</div>
    <p>${esc(fmtTime(new Date()))} · ${esc(S.loc.name)}</p>
    <div class="dua">اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ</div>
    <button class="btn" id="adhanClose" type="button">إيقاف الأذان</button>
  </div>`;
  document.body.appendChild(ov);
  $('#adhanClose', ov).addEventListener('click', () => { stopAdhan(); ov.remove(); });
}

let fired = LS.get('fired', {});
const dk0 = (st) => key(st.t);
function checkAdhan(st, now) {
  const dk = key(st.t);
  let changed = false;
  for (const k of FARD) {
    if (!S.adhan[k]) continue;
    const t = st.today[k].getTime();
    const diff = now.getTime() - t;
    const id = dk + k;
    if (diff >= 0 && diff < 5 * 60000 && !fired[id]) {
      fired[id] = 1; changed = true;
      showAdhan(k, st.friday);
      if (!NATIVE || diff < 20000) playAdhan();
      notify(`حان وقت صلاة ${pName(k, st.friday)}`, `${fmtTime(st.today[k])} — ${S.loc.name}`);
    }
    if (S.reminder > 0) {
      const rdiff = now.getTime() - (t - S.reminder * 60000);
      if (rdiff >= 0 && rdiff < 3 * 60000 && !fired[id + 'r']) {
        fired[id + 'r'] = 1; changed = true;
        const msg = `بقي ${minutesWord(S.reminder)} على صلاة ${pName(k, st.friday)}`;
        toast(msg, 5000);
        notify(msg, `الأذان عند ${fmtTime(st.today[k])}`);
      }
    }
  }
  for (const r of adhkarReminders(st.today)) {
    const id = dk0(st) + r.k;
    const rd = now.getTime() - r.t;
    if (rd >= 0 && rd < 3 * 60000 && !fired[id]) {
      fired[id] = 1; changed = true;
      if (!document.hidden) toast(`${r.body}. افتح «الأذكار» لقراءتها.`, 5000);
      else if (!NATIVE) notify(r.title, r.body);
    }
  }
  if (changed) {
    const keys = Object.keys(fired);
    if (keys.length > 40) keys.slice(0, keys.length - 40).forEach((x) => delete fired[x]);
    LS.set('fired', fired);
  }
}

/* ---------- Quran data ---------- */
let Q = null, Qp = null;
const OFF = [];
function loadQuran() {
  if (!Qp) {
    Qp = fetch('quran.json').then((r) => { if (!r.ok) throw new Error('quran ' + r.status); return r.json(); }).then((d) => {
      Q = d;
      let n = 0; for (let i = 0; i < Q.length; i++) { OFF[i] = n; n += Q[i][2].length; }
      return d;
    }).catch((e) => { Qp = null; throw e; });
  }
  return Qp;
}
function juzOf(s, a) {
  let j = 1;
  for (let i = 0; i < 30; i++) { const [js, ja] = JUZ[i]; if (s > js || (s === js && a >= ja)) j = i + 1; }
  return j;
}
const surahName = (s) => (Q ? Q[s - 1][0] : '');
const norm = (s) => s
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
  .replace(/[ٱأإآا]/g, '')
  .replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[ؤ]/g, 'و').replace(/[ئ]/g, 'ي').replace(/ء/g, '')
  .replace(/\s+/g, ' ').trim();
let QN = null;
function searchQuran(q) {
  if (!QN) { QN = []; Q.forEach((sr, si) => sr[2].forEach((v, ai) => QN.push([si + 1, ai + 1, norm(v)]))); }
  const n = norm(q);
  if (n.length < 2) return [];
  const out = [];
  for (const r of QN) { if (r[2].includes(n)) { out.push(r); if (out.length >= 150) break; } }
  return out;
}

let bookmarks = LS.get('bookmarks', []);
let lastRead = LS.get('lastRead', null);
const isMarked = (s, a) => bookmarks.some((b) => b.s === s && b.a === a);
function toggleMark(s, a) {
  if (isMarked(s, a)) bookmarks = bookmarks.filter((b) => !(b.s === s && b.a === a));
  else bookmarks.unshift({ s, a, t: Date.now() });
  LS.set('bookmarks', bookmarks);
}

/* ---------- recitation player (gapless: the next ayah loads while this one plays) ---------- */
const P = { s: 0, a: 0, playing: false, cur: null, curTries: [], nxt: null, nxtKey: '', nxtTries: [] };
function audioFor(s, a) {
  const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
  const brs = [rec[2], 128, 64, 192, 48, 32].filter((v, i, arr) => arr.indexOf(v) === i);
  return brs.map((br) => `https://cdn.islamic.network/quran/audio/${br}/${rec[0]}/${OFF[s - 1] + a}.mp3`);
}
function followingAyah(s, a) {
  if (!Q) return null;
  if (a < Q[s - 1][2].length) return { s, a: a + 1 };
  if (s < 114) return { s: s + 1, a: 1 };
  return null;
}
function newAudio() { const au = new Audio(); au.preload = 'auto'; return au; }
function wireAudio(au, tries) {
  au.onended = () => { if (au === P.cur) advanceAyah(); };
  au.onplaying = () => { if (au === P.cur) preloadNext(); };
  au.ontimeupdate = () => { if (au === P.cur) playerProgress(); };
  au.onerror = () => {
    if (au !== P.cur || !P.playing) return;
    const n = tries.shift();
    if (n) { au.src = n; au.play().catch(() => {}); }
    else { P.playing = false; renderPlayer(); toast('تعذر تحميل التلاوة. تحقق من الاتصال بالإنترنت.'); }
  };
}
function preloadNext() {
  const f = followingAyah(P.s, P.a);
  if (!f) return;
  const k = f.s + ':' + f.a;
  if (P.nxtKey === k && P.nxt) return;
  const tries = audioFor(f.s, f.a);
  const au = newAudio();
  au.onerror = () => { if (au !== P.nxt) return; const n = P.nxtTries.shift(); if (n) { au.src = n; au.load(); } };
  au.src = tries.shift(); au.load();
  P.nxt = au; P.nxtKey = k; P.nxtTries = tries;
}
function dropAudio(au) { if (!au) return; au.onended = au.onerror = au.onplaying = au.ontimeupdate = null; try { au.pause(); au.removeAttribute('src'); au.load(); } catch (e) { /* ignore */ } }
function playAyah(s, a) {
  stopAdhan();
  dropAudio(P.cur); dropAudio(P.nxt); P.nxt = null; P.nxtKey = '';
  P.s = s; P.a = a; P.playing = true;
  const tries = audioFor(s, a);
  P.cur = newAudio(); P.curTries = tries;
  wireAudio(P.cur, tries);
  P.cur.src = tries.shift();
  P.cur.play().catch(() => {});
  afterAyahChange();
}
function advanceAyah() {
  const f = followingAyah(P.s, P.a);
  if (!f) { stopPlayer(); return; }
  const k = f.s + ':' + f.a;
  if (P.nxt && P.nxtKey === k) {
    const old = P.cur;
    P.cur = P.nxt; P.curTries = P.nxtTries; P.nxt = null; P.nxtKey = '';
    wireAudio(P.cur, P.curTries);
    P.s = f.s; P.a = f.a;
    P.cur.play().catch(() => {});
    dropAudio(old);
    afterAyahChange();
  } else {
    playAyah(f.s, f.a);
  }
}
function afterAyahChange() {
  if (reader.open && reader.s !== P.s) { reader.s = P.s; reader.target = P.a; drawSurah(); }
  markPlaying(); renderPlayer(); mediaSession();
}
function prevAyah() {
  if (!P.s) return;
  let { s, a } = P;
  if (a > 1) a--; else if (s > 1) { s--; a = Q[s - 1][2].length; }
  playAyah(s, a);
}
function togglePlay() {
  if (!P.cur) { const a = lastRead && lastRead.s === reader.s ? lastRead.a : 1; playAyah(reader.s, a); return; }
  if (P.playing) { P.cur.pause(); P.playing = false; } else { P.cur.play().catch(() => {}); P.playing = true; }
  renderPlayer();
}
function stopPlayer() {
  dropAudio(P.cur); dropAudio(P.nxt);
  P.cur = null; P.nxt = null; P.nxtKey = ''; P.playing = false; P.s = 0;
  markPlaying(); renderPlayer();
}
function markPlaying() {
  $$('.ayah.playing').forEach((e) => e.classList.remove('playing'));
  if (!P.s || !reader.open || reader.s !== P.s) return;
  const el = $(`.ayah[data-a="${P.a}"]`);
  if (!el) return;
  el.classList.add('playing');
  // Follow the recitation without jumping: only scroll when the ayah leaves the comfortable band.
  const sc = $('#rScroll'); if (!sc) return;
  const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect();
  if (r.top < b.top + b.height * 0.12 || r.bottom > b.top + b.height * 0.72) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    sc.scrollTo({ top: sc.scrollTop + (r.top - b.top) - b.height * 0.28, behavior: reduce ? 'auto' : 'smooth' });
  }
}
const WAVE = Array.from({ length: 42 }, (_, i) => 30 + Math.round(60 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))));
function playerProgress() {
  const bar = $('.player .wave'); if (!bar) return;
  const n = P.cur && P.cur.duration ? Math.round(Math.min(1, P.cur.currentTime / P.cur.duration) * WAVE.length) : 0;
  if (bar.dataset.n === String(n)) return;
  bar.dataset.n = String(n);
  Array.from(bar.children).forEach((b, i) => b.classList.toggle('on', i < n));
}
function renderPlayer() {
  let bar = $('.player');
  const show = reader.open || P.s;
  if (!show) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.className = 'player'; document.body.appendChild(bar); }
  const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
  const where = P.s ? `سورة ${esc(surahName(P.s))} · الآية ${arNum(P.a)}` : 'اضغط للاستماع إلى السورة';
  const marked = P.s ? isMarked(P.s, P.a) : false;
  bar.innerHTML = `<div class="inner">
    <div class="pl-top">
      <button class="pl-mini" id="pMark" type="button" aria-label="علامة على الآية" ${P.s ? '' : 'disabled'}>${marked ? I.markFill : I.mark}</button>
      <div class="info"><b>${esc(rec[1])}</b><span>${where}</span></div>
      <button class="pl-mini" id="pStop" type="button" aria-label="إيقاف التلاوة" ${P.s ? '' : 'hidden'}>${I.close}</button>
    </div>
    <div class="wave" aria-hidden="true">${WAVE.map((h) => `<i style="height:${h}%"></i>`).join('')}</div>
    <div class="pl-ctrl">
      <button class="pl-btn" id="pNext" type="button" aria-label="الآية التالية">${I.skipNext}</button>
      <button class="round" id="pToggle" type="button" aria-label="${P.playing ? 'إيقاف مؤقت' : 'تشغيل'}">${P.playing ? I.pause : I.play}</button>
      <button class="pl-btn" id="pPrev" type="button" aria-label="الآية السابقة">${I.skipPrev}</button>
    </div>
  </div>`;
  $('#pToggle', bar).onclick = togglePlay;
  $('#pStop', bar).onclick = stopPlayer;
  $('#pNext', bar).onclick = () => (P.s ? advanceAyah() : togglePlay());
  $('#pPrev', bar).onclick = prevAyah;
  $('#pMark', bar).onclick = () => {
    if (!P.s) return;
    toggleMark(P.s, P.a); renderPlayer();
    const sp = reader.s === P.s && $(`.ayah[data-a="${P.a}"]`); if (sp) sp.classList.toggle('marked', isMarked(P.s, P.a));
    toast(isMarked(P.s, P.a) ? 'أضيفت العلامة' : 'أزيلت العلامة');
  };
  playerProgress();
}
function mediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
    navigator.mediaSession.metadata = new MediaMetadata({ title: `سورة ${surahName(P.s)} — ${arNum(P.a)}`, artist: rec[1], album: 'القرآن الكريم', artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('nexttrack', advanceAyah);
    navigator.mediaSession.setActionHandler('previoustrack', prevAyah);
  } catch (e) { /* unsupported */ }
}

/* =========================================================
   Views
   ========================================================= */
let current = null;
let tickTimer = null;
let compassCleanup = null;

function setTab(name) {
  $$('.tabbar a').forEach((a) => { if (a.dataset.tab === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}

/* ---------- ornament & scenery ---------- */
let patId = 0;
function patternSvg() {
  const id = 'kh' + (++patId);
  return `<svg class="pattern" aria-hidden="true" width="100%" height="100%"><defs><pattern id="${id}" width="44" height="44" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width="1.1"><rect x="12" y="12" width="20" height="20"/><rect x="12" y="12" width="20" height="20" transform="rotate(45 22 22)"/><circle cx="22" cy="22" r="4"/><path d="M22 0v5.9M22 38.1V44M0 22h5.9M38.1 22H44M0 0l7.9 7.9M44 0l-7.9 7.9M0 44l7.9-7.9M44 44l-7.9-7.9"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
}
const STAR8 = '<svg viewBox="0 0 44 44" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="9" width="26" height="26" rx="2"/><rect x="9" y="9" width="26" height="26" rx="2" transform="rotate(45 22 22)"/></g></svg>';
const ROSETTE = '<svg viewBox="0 0 20 20" aria-hidden="true"><g fill="var(--paper)" stroke="currentColor" stroke-width="1.2"><rect x="4" y="4" width="12" height="12"/><rect x="4" y="4" width="12" height="12" transform="rotate(45 10 10)"/></g><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>';
function skylineSvg() {
  const win = (x) => `<path d="M${x} 122V113a5 5 0 0 1 10 0V122Z"/>`;
  return `<svg viewBox="0 0 600 130" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path fill="currentColor" opacity=".55" d="M0 130V108H30V100H52V96C52 86 62 80 68 78C74 80 84 86 84 96V100H100V108H112V60L116 46L120 60V108H140V114H160V130ZM440 130V114H462V104H474V98C474 88 484 82 490 80C496 82 506 88 506 98V104H520V110H532V64L536 50L540 64V110H560V102H600V130Z"/>
    <g fill="currentColor">
      <rect x="230" y="88" width="140" height="42"/>
      <rect x="246" y="84" width="108" height="6"/>
      <path d="M240 86C240 58 270 44 300 36C330 44 360 58 360 86Z"/>
      <rect x="298.6" y="22" width="2.8" height="16"/>
      <path d="M303.5 12.5a6.5 6.5 0 1 0 0 10.6a5 5 0 1 1 0-10.6Z"/>
      <rect x="195" y="100" width="40" height="30"/>
      <path d="M197 102C197 86 207 80 215 76C223 80 233 86 233 102Z"/>
      <rect x="214" y="66" width="2" height="11"/>
      <rect x="365" y="100" width="40" height="30"/>
      <path d="M367 102C367 86 377 80 385 76C393 80 403 86 403 102Z"/>
      <rect x="384" y="66" width="2" height="11"/>
      <rect x="171" y="40" width="10" height="90"/><rect x="167" y="62" width="18" height="4" rx="1"/><rect x="168" y="90" width="16" height="3" rx="1"/>
      <path d="M171 40L176 18L181 40Z"/><rect x="175.4" y="8" width="1.2" height="11"/>
      <rect x="419" y="40" width="10" height="90"/><rect x="415" y="62" width="18" height="4" rx="1"/><rect x="416" y="90" width="16" height="3" rx="1"/>
      <path d="M419 40L424 18L429 40Z"/><rect x="423.4" y="8" width="1.2" height="11"/>
      <rect x="0" y="126" width="600" height="4"/>
    </g>
    <g fill="var(--win, transparent)" opacity=".9">
      ${[244, 262, 328, 346].map(win).join('')}
      <path d="M291 130V111a9 9 0 0 1 18 0V130Z"/>
      ${[205, 375].map((x) => win(x)).join('')}
      <rect x="174" y="72" width="4" height="8" rx="2"/><rect x="422" y="72" width="4" height="8" rx="2"/>
    </g>
  </svg>`;
}
let starsCache = '';
function starsSvg() {
  if (starsCache) return starsCache;
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let c = '';
  for (let i = 0; i < 46; i++) c += `<circle cx="${(rnd() * 100).toFixed(1)}%" cy="${(rnd() * 62).toFixed(1)}%" r="${(0.5 + rnd() * 1.1).toFixed(2)}" fill="#fff" opacity="${(0.35 + rnd() * 0.6).toFixed(2)}"/>`;
  starsCache = `<svg class="stars" width="100%" height="100%" aria-hidden="true">${c}</svg>`;
  return starsCache;
}
function phaseOf(now, st) {
  const T = st.today, m = 60000;
  if (now < T.fajr || now >= T.isha) return 'night';
  if (now < T.sunrise) return 'dawn';
  if (now < T.dhuhr - 90 * m) return 'morning';
  if (now < T.asr) return 'day';
  if (now < T.maghrib - 35 * m) return 'afternoon';
  if (now < T.maghrib.getTime() + 20 * m) return 'sunset';
  return 'dusk';
}
function placeOrb(now, st) {
  const orb = $('#orb'); if (!orb) return;
  const T = st.today;
  if (now >= T.sunrise && now < T.maghrib) {
    const f = (now - T.sunrise) / (T.maghrib - T.sunrise);
    orb.className = 'orb sun';
    orb.style.left = '14%';
    orb.style.top = (54 - Math.sin(Math.PI * f) * 22).toFixed(1) + '%';
  } else {
    orb.className = 'orb moon';
    orb.style.left = '14%'; orb.style.top = '40%';
  }
}
function verseOfDay(t) {
  if (!Q) return null;
  const total = OFF[113] + Q[113][2].length;
  let n = ((t.y * 372 + t.m * 31 + t.d) * 7919) % total;
  for (let tries = 0; tries < 400; tries++, n = (n + 1) % total) {
    let s = 1; while (s < 114 && OFF[s] <= n) s++;
    const a = n - OFF[s - 1] + 1;
    const txt = Q[s - 1][2][a - 1];
    if (txt.length > 40 && txt.length < 150) return { s, a, txt };
  }
  return null;
}

/* ---------- brand & illustrations ---------- */
const LOGO = '<svg class="logo" viewBox="0 0 40 46" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M5 44V24C5 15 11 10 20 6c9 4 15 9 15 18v20"/><path d="M12 44V30c0-5 3-8 8-10 5 2 8 5 8 10v14"/><path d="M2 44h36"/></g><path d="M22.4 4.2a3.4 3.4 0 1 1-2.6-3.9 2.6 2.6 0 1 0 2.6 3.9z" fill="currentColor"/></svg>';
const SPARK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0c.6 4.3 3.7 7.4 8 8-4.3.6-7.4 3.7-8 8-.6-4.3-3.7-7.4-8-8 4.3-.6 7.4-3.7 8-8z" fill="currentColor"/></svg>';
const brand = () => `<header class="brand wrap">${LOGO}<b>مِحراب</b></header>`;
const pageTitle = (t, sub) => `<div class="ptitle wrap"><h1>${t}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;
function beadsSvg(w) {
  let b = '';
  for (let i = 0; i < 17; i++) {
    const a = (-80 + i * (340 / 17)) * Math.PI / 180;
    b += `<circle cx="${(60 + 34 * Math.cos(a + Math.PI / 2)).toFixed(1)}" cy="${(36 - 25 * Math.sin(a + Math.PI / 2)).toFixed(1)}" r="5.2" fill="url(#gBead)"/>`;
  }
  return `<svg class="ill" viewBox="0 0 120 92" aria-hidden="true"${w ? ` width="${w}"` : ''}>${b}
    <circle cx="60" cy="64" r="6.4" fill="url(#gBead)"/><path d="M60 70v6" stroke="#B8914A" stroke-width="2"/>
    <path d="M55 76h10l4 15H51z" fill="url(#gGold)"/><path d="M56 80l-2 10M60 80v11M64 80l2 10" stroke="#9C7631" stroke-width=".8"/></svg>`;
}
const ILL = {
  morning: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><g stroke="#E5B458" stroke-width="2.4" stroke-linecap="round"><path d="M60 13v8M37 21l5 6M83 21l-5 6M24 38l7 3M96 38l-7 3"/></g><circle cx="60" cy="50" r="19" fill="url(#gSun)"/><path d="M-2 58C22 46 40 50 60 56S98 50 122 54V82H-2Z" fill="#A9CDB2"/><path d="M-2 66C26 56 48 60 70 66S104 62 122 64V82H-2Z" fill="#6FA888"/><path d="M-2 73C30 66 70 70 122 72V82H-2Z" fill="#3E8466"/></svg>`,
  evening: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><circle cx="58" cy="34" r="22" fill="url(#gGold)" mask="url(#mMoonE)"/><circle cx="28" cy="16" r="1.6" fill="#E0BE73"/><circle cx="94" cy="14" r="1.3" fill="#E0BE73"/><circle cx="101" cy="31" r="1.5" fill="#E0BE73"/><path d="M22 70a9 9 0 0 1 8-12 13 13 0 0 1 24-6 10 10 0 0 1 15 6 8 8 0 0 1 2 16H28a7 7 0 0 1-6-4z" fill="#E4EBE6"/><path d="M56 74a8 8 0 0 1 9-11 12 12 0 0 1 22-3 9 9 0 0 1 13 8 7 7 0 0 1-2 12H62a6 6 0 0 1-6-6z" fill="#CCD9D0"/></svg>`,
  prayer: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="73" width="104" height="4" rx="2" fill="#D3E3D8"/><g fill="#EFE7D5"><rect x="17" y="22" width="8" height="52"/><rect x="95" y="22" width="8" height="52"/></g><g fill="#1F6A52"><path d="M16 23l5-14 5 14z"/><path d="M94 23l5-14 5 14z"/></g><g fill="#C9A85A"><rect x="15" y="36" width="12" height="3" rx="1"/><rect x="93" y="36" width="12" height="3" rx="1"/><rect x="59.2" y="7" width="1.6" height="12"/><circle cx="60" cy="7" r="2.4"/></g><rect x="30" y="46" width="60" height="28" rx="2" fill="#F4EEDF"/><rect x="40" y="45" width="40" height="5" fill="#E3D9C1"/><path d="M38 47C38 30 50 22 60 18 70 22 82 30 82 47Z" fill="url(#gDome)"/><path d="M54 74V63a6 6 0 0 1 12 0v11z" fill="#1F6A52"/><g fill="#2E7A60"><path d="M37 66v-5a3 3 0 0 1 6 0v5zM77 66v-5a3 3 0 0 1 6 0v5z"/></g></svg>`,
  sleep: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><path d="M14 70C14 36 36 14 60 14S106 36 106 70Z" fill="url(#gNight)"/><circle cx="66" cy="34" r="10" fill="url(#gGold)" mask="url(#mMoonS)"/><circle cx="40" cy="34" r="1.3" fill="#E9D59C"/><circle cx="86" cy="44" r="1.2" fill="#E9D59C"/><circle cx="50" cy="22" r="1" fill="#E9D59C"/><path d="M22 68c0-8 9-13 38-13s38 5 38 13-9 10-38 10-38-2-38-10z" fill="#F6F1E5" stroke="#DCD2BC"/><path d="M34 66c8-3 44-3 52 0" fill="none" stroke="#E2D9C5" stroke-width="1.4"/></svg>`,
  wake: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><path d="M32 76V42C32 26 45 16 60 11c15 5 28 15 28 31v34Z" fill="#FCEFD2"/><g clip-path="url(#cWin)"><circle cx="60" cy="58" r="14" fill="url(#gSun)"/><path d="M28 62c12-6 22-4 32 0s20 4 32-2v20H28z" fill="#8FBE9E"/><path d="M28 70c14-5 30-3 64 0v10H28z" fill="#4A8C6E"/></g><path d="M32 76V42C32 26 45 16 60 11c15 5 28 15 28 31v34Z" fill="none" stroke="#C9A85A" stroke-width="2.4"/><rect x="24" y="74" width="72" height="4" rx="2" fill="#C9A85A"/></svg>`,
  quran: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><g stroke="#E5B458" stroke-width="1.8" stroke-linecap="round" opacity=".9"><path d="M60 6v9M44 10l4 7M76 10l-4 7M32 20l6 4M88 20l-6 4"/></g><path d="M60 32C48 26 30 26 16 30v40c14-4 32-4 44 2z" fill="#FBF7EC" stroke="#D9CDB0"/><path d="M60 32c12-6 30-6 44-2v40c-14-4-32-4-44 2z" fill="#FBF7EC" stroke="#D9CDB0"/><path d="M12 32v42c18-4 36-4 48 2 12-6 30-6 48-2V32" fill="none" stroke="#1F6A52" stroke-width="3" stroke-linejoin="round"/><g stroke="#C8D5CC" stroke-width="1.2" stroke-linecap="round"><path d="M24 40h26M24 47h26M24 54h22M70 40h26M70 47h26M74 54h22"/></g></svg>`,
  rahl: `<svg class="ill" viewBox="0 0 140 110" aria-hidden="true"><path d="M34 104L98 56M106 104L42 56" stroke="url(#gWood)" stroke-width="9" stroke-linecap="round"/><path d="M34 104L98 56" stroke="#B98552" stroke-width="2" stroke-linecap="round" opacity=".6"/><g transform="rotate(-10 70 50)"><rect x="30" y="58" width="80" height="8" rx="2" fill="#F1E7CF"/><rect x="28" y="12" width="84" height="52" rx="5" fill="#165C49" stroke="#C9A85A" stroke-width="2"/><rect x="35" y="18" width="70" height="40" rx="3" fill="none" stroke="#C9A85A" stroke-width="1"/><circle cx="70" cy="38" r="13" fill="#0F4A3C" stroke="#D6B46C" stroke-width="1.6"/><g fill="none" stroke="#E2C27C" stroke-width="1.2"><rect x="63" y="31" width="14" height="14"/><rect x="63" y="31" width="14" height="14" transform="rotate(45 70 38)"/></g></g></svg>`,
  zakat: `<svg class="ill" viewBox="0 0 120 80" aria-hidden="true"><ellipse cx="44" cy="68" rx="22" ry="6" fill="#C89B45"/><rect x="22" y="56" width="44" height="12" fill="#D9AE58"/><ellipse cx="44" cy="56" rx="22" ry="6" fill="#EBC977"/><ellipse cx="44" cy="52" rx="22" ry="6" fill="#C89B45"/><rect x="22" y="40" width="44" height="12" fill="#D9AE58"/><ellipse cx="44" cy="40" rx="22" ry="6" fill="#F0D58E"/><path d="M78 74V40" stroke="#1F6A52" stroke-width="3" stroke-linecap="round"/><path d="M66 44h24" stroke="#1F6A52" stroke-width="3" stroke-linecap="round"/><path d="M66 44l-6 14h12zM90 44l-6 14h12z" fill="none" stroke="#1F6A52" stroke-width="2" stroke-linejoin="round"/><path d="M60 58a6 3 0 0 0 12 0M84 58a6 3 0 0 0 12 0" fill="#CFE2D6"/><rect x="70" y="72" width="16" height="4" rx="2" fill="#1F6A52"/></svg>`,
  beads: beadsSvg(),
  compass: `<svg class="ill" viewBox="0 0 120 92" aria-hidden="true"><circle cx="60" cy="10" r="6" fill="none" stroke="#C9A85A" stroke-width="3"/><rect x="56" y="13" width="8" height="7" rx="2" fill="#C9A85A"/><circle cx="60" cy="54" r="36" fill="url(#gGold)"/><circle cx="60" cy="54" r="31" fill="#FBF6EA"/><circle cx="60" cy="54" r="31" fill="none" stroke="#1F6A52" stroke-width="2"/><g stroke="#1F6A52" stroke-width="1.6" stroke-linecap="round"><path d="M60 26v5M60 77v5M32 54h5M83 54h5"/></g><path d="M60 54l-4-18 4-6 4 6z" fill="#1F6A52"/><path d="M60 54l4 18-4 6-4-6z" fill="#C9A85A"/><rect x="69" y="31" width="10" height="9" rx="1" fill="#1A1A1A"/><rect x="69" y="33.5" width="10" height="1.6" fill="#D6B46C"/><circle cx="60" cy="54" r="3" fill="#C9A85A"/></svg>`,
  calendar: `<svg class="ill" viewBox="0 0 120 92" aria-hidden="true"><path d="M24 84l8-62h64l-8 62z" fill="#0F4A3C" opacity=".25"/><rect x="22" y="20" width="76" height="64" rx="6" fill="#FBF6EA" stroke="#D9CDB0"/><rect x="22" y="20" width="76" height="16" rx="6" fill="#1F6A52"/><rect x="22" y="30" width="76" height="6" fill="#1F6A52"/><g fill="#C9A85A"><rect x="36" y="12" width="5" height="14" rx="2.5"/><rect x="58" y="12" width="5" height="14" rx="2.5"/><rect x="80" y="12" width="5" height="14" rx="2.5"/></g><g fill="#DCE7DF"><rect x="30" y="44" width="10" height="8" rx="1.5"/><rect x="44" y="44" width="10" height="8" rx="1.5"/><rect x="58" y="44" width="10" height="8" rx="1.5"/><rect x="72" y="44" width="10" height="8" rx="1.5"/><rect x="30" y="56" width="10" height="8" rx="1.5"/><rect x="44" y="56" width="10" height="8" rx="1.5"/><rect x="72" y="56" width="10" height="8" rx="1.5"/><rect x="30" y="68" width="10" height="8" rx="1.5"/><rect x="44" y="68" width="10" height="8" rx="1.5"/><rect x="58" y="68" width="10" height="8" rx="1.5"/></g><rect x="58" y="56" width="10" height="8" rx="1.5" fill="#1F6A52"/></svg>`,
};
const ARCH_PATH = 'M2 300V120C2 80 42 60 98 46 150 33 186 20 200 3c14 17 50 30 102 43 56 14 96 34 96 74v180Z';
const HISN_ICONS = [
  [/سفر|مسافر|الركوب|المركوب|القرية|السوق|منزلا/, '<path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3M4 13h16"/>'],
  [/المنزل|البيت/, '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>'],
  [/الطعام|إفطار|أفطر|الضيف|سقاه|الثمر|الصائم/, '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>'],
  [/المسجد|الأذان|الاستفتاح|الركوع|السجود|التشهد|السلام من|الوتر|الاستخارة|التلاوة|الجلسة/, '<path d="M4 21V12a8 8 0 0 1 16 0v9"/><path d="M9 21v-5a3 3 0 0 1 6 0v5M3 21h18M12 4V2"/>'],
  [/الوضوء|الخلاء/, '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>'],
  [/النوم|الليل|الرؤيا|الاستيقاظ|الفزع|تقلب/, '<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11z"/>'],
  [/المطر|الريح|الرعد|الاستسقاء|الاستصحاء|الهلال/, '<path d="M7 17a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4 4 0 0 1 0 8z"/><path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2"/>'],
  [/المريض|وجع|مصيبة|الهم|الكرب|الحزن|مبتلى|العين/, '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'],
  [/الثوب/, '<path d="M8 3l4 3 4-3 5 4-3 4-2-1v11H8V10l-2 1-3-4z"/>'],
  [/الحج|العمرة|عرفة|الصفا|المشعر|الجمار|الركن|المحرم/, '<path d="M5 9l7-4 7 4v11H5z"/><path d="M5 12h14"/>'],
  [/الميت|القبور|الدفن|التعزية|المحتضر|الفرط/, '<path d="M12 21c-4-3-6-7-6-11a6 6 0 0 1 12 0c0 4-2 8-6 11z"/><path d="M12 8v6"/>'],
  [/الاستغفار|التوبة|أذنب|التسبيح|يسبح|الصلاة على النبي/, '<circle cx="12" cy="5" r="1.6"/><circle cx="17" cy="7.5" r="1.6"/><circle cx="18.5" cy="12.5" r="1.6"/><circle cx="7" cy="7.5" r="1.6"/><circle cx="5.5" cy="12.5" r="1.6"/><circle cx="12" cy="17" r="1.6"/><path d="M12 18.6V22"/>'],
];
function hisnIcon(title) {
  const plain = title.replace(/[ً-ْٰـ]/g, '');
  const hit = HISN_ICONS.find(([re]) => re.test(plain));
  const body = hit ? hit[1] : '<rect x="6" y="6" width="12" height="12"/><rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)"/>';
  return `<svg class="h-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ---------- Home ---------- */
function renderHome() {
  const st = state();
  const now = new Date();
  const showArm = !NATIVE && FARD.some((k) => S.adhan[k]) && !audioArmed && !(navigator.userActivation && navigator.userActivation.hasBeenActive);
  const ctxAdk = contextualAdhkar(st, now);
  const adkTitle = { morning: 'أذكار الصباح', evening: 'أذكار المساء', sleep: 'أذكار النوم' }[ctxAdk];
  const place = [S.loc.name, S.loc.region || S.loc.country].filter(Boolean).join('، ');
  app.innerHTML = `
  ${brand()}
  <main class="wrap home">
    <div class="home-bar">
      <button class="loc-pill" id="placeBtn" type="button" aria-label="تغيير الموقع: ${esc(place)}">${I.pin}<span>${esc(place)}</span>${I.chevDown}</button>
      <button class="sq-btn" id="monthBtn" type="button" aria-label="جدول مواقيت الشهر">${I.cal}</button>
    </div>
    <section class="arch" aria-live="polite">
      <svg class="arch-shape" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCH_PATH}" fill="url(#gArch)"/><path d="${ARCH_PATH}" fill="none" stroke="var(--gold-2)" stroke-width="2.2" vector-effect="non-scaling-stroke"/></svg>
      <span class="arch-chip" id="hijri">${esc(fmt('hijriShort', now))}</span>
      <div class="arch-body">
        <div class="label" id="nextLabel"></div>
        <div class="name" id="nextName"></div>
        <output class="count" id="countdown">--:--:--</output>
        <div class="at" id="nextAt"></div>
      </div>
      <div class="skyline">${skylineSvg()}</div>
    </section>
    <ul class="ptimes" id="times" aria-label="مواقيت اليوم"></ul>
    ${S.loc.auto ? `<div class="banner">${I.pin}<span>المواقيت محسوبة لمدينة ${esc(S.loc.name)}. حدّد موقعك لدقة أكبر.</span><button class="btn small primary" id="locateBtn" type="button">موقعي</button></div>` : ''}
    ${showArm ? `<div class="banner" id="armBanner">${I.bellOn}<span>المس الشاشة مرة لتفعيل صوت الأذان، وأبقِ التطبيق مفتوحًا.</span></div>` : ''}
    <div class="quick2">
      <button class="qcard" id="adhkarTile" type="button">${beadsSvg()}<span class="q-text"><b>${adkTitle}</b><small id="adkSub">&nbsp;</small></span>${I.next}</button>
      <button class="qcard" id="contRead" type="button">${ILL.quran}<span class="q-text"><b>${lastRead ? 'متابعة القراءة' : 'المصحف الشريف'}</b><small id="contReadSub">${lastRead ? '&nbsp;' : 'ابدأ من الفاتحة'}</small></span>${I.next}</button>
    </div>
    <div class="tools">
      <button class="tool" id="zakatTile" type="button"><span class="t-ill">${ILL.zakat}</span><b>حاسبة الزكاة</b></button>
      <button class="tool" id="tasbihHome" type="button"><span class="t-ill">${beadsSvg()}</span><b>السبحة</b></button>
      <button class="tool" id="qiblaTile" type="button"><span class="t-ill">${ILL.compass}</span><b>القبلة ${Math.round(qiblaBearing())}°</b></button>
      <button class="tool" id="monthTile" type="button"><span class="t-ill">${ILL.calendar}</span><b>جدول الشهر</b></button>
    </div>
    <div id="verseSlot"></div>
  </main>`;
  renderTimes(st);
  $('#monthBtn').onclick = () => openMonth();
  $('#placeBtn').onclick = () => { location.hash = 'prefs'; };
  $('#qiblaTile').onclick = () => { location.hash = 'qibla'; };
  $('#zakatTile').onclick = () => { location.hash = 'zakat'; };
  $('#monthTile').onclick = () => openMonth();
  $('#tasbihHome').onclick = () => { location.hash = 'tasbih'; };
  $('#adhkarTile').onclick = () => { location.hash = 'dhikr-' + contextualAdhkar(state(), new Date()); };
  $('#contRead').onclick = () => { loadQuran().then(() => openSurah(lastRead ? lastRead.s : 1, lastRead ? lastRead.a : 1)).catch(quranErr); };
  const lb = $('#locateBtn'); if (lb) lb.onclick = () => locate();
  loadAdhkar().then(() => {
    const el = $('#adkSub'); if (!el) return;
    const c = adkCat(ctxAdk); const done = adkDone(ctxAdk);
    el.textContent = done === c.items.length ? 'أتممتها اليوم' : done ? `${arNum(done)} من ${arNum(c.items.length)}` : dhikrWord(c.items.length);
  }).catch(() => {});
  loadQuran().then(() => {
    const el = $('#contReadSub'); if (el && lastRead) el.textContent = `${surahName(lastRead.s)} · الآية ${arNum(lastRead.a)}`;
    const v = verseOfDay(st.t); const slot = $('#verseSlot'); if (!v || !slot) return;
    slot.innerHTML = `<section class="verse">${patternSvg()}<h3>${SPARK} آية اليوم ${SPARK}</h3><p>${esc(v.txt)}</p><div class="ref">سورة ${esc(surahName(v.s))} · الآية ${arNum(v.a)}</div><button class="btn small" id="verseGo" type="button">${I.book} اقرأ في المصحف</button></section>`;
    $('#verseGo').onclick = () => openSurah(v.s, v.a);
  }).catch(() => {});
  updateHero(st);
}
function renderTimes(st) {
  const ul = $('#times'); if (!ul) return;
  const now = new Date();
  ul.innerHTML = PRAYERS.map((p) => {
    const t = st.today[p.key];
    const isNext = !st.next.tomorrow && st.next.key === p.key;
    const past = t <= now && !isNext;
    const on = !p.noAdhan && S.adhan[p.key];
    const sub = p.key === 'dhuhr' && st.friday ? '<small>صلاة الجمعة</small>' : '';
    return `<li class="${isNext ? 'is-next' : ''} ${past ? 'is-past' : ''}">
      <span class="p-ico">${ICONS[p.key]}</span>
      <span class="p-name">${esc(pName(p.key, st.friday))}${sub}</span>
      <span class="p-time">${esc(fmtTime(t))}</span>
      <button class="bell" type="button" data-k="${p.key}" ${p.noAdhan ? 'disabled aria-label="لا أذان للشروق"' : `aria-pressed="${on}" aria-label="أذان ${esc(p.name)}: ${on ? 'مفعل' : 'متوقف'}"`}>${on ? (isNext ? I.bellFill : I.bellOn) : I.bellOff}</button>
    </li>`;
  }).join('');
  $$('.bell[data-k]', ul).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k; if (PRAYERS.find((p) => p.key === k).noAdhan) return;
    S.adhan[k] = !S.adhan[k]; save(); renderTimes(state());
    toast(S.adhan[k] ? `تم تفعيل أذان ${pName(k)}` : `تم إيقاف أذان ${pName(k)}`);
  }));
}
let lastMinute = -1;
function updateHero(st) {
  const now = new Date();
  const nn = $('#nextName'); if (!nn) return;
  $('#nextLabel').textContent = st.next.tomorrow ? 'الصلاة القادمة (غدًا)' : 'الصلاة القادمة';
  nn.textContent = pName(st.next.key, st.next.tomorrow ? isFriday(addDays(st.t, 1)) : st.friday);
  $('#countdown').textContent = fmtLeft(st.next.time - now);
  $('#nextAt').textContent = `الأذان عند ${fmtTime(st.next.time)}`;
  if (now.getMinutes() !== lastMinute) {
    lastMinute = now.getMinutes();
    renderTimes(st);
    $('#hijri').textContent = fmt('hijriShort', now);
  }
}

/* ---------- Quran ---------- */
let qtab = LS.get('qtab', 'surah');
let qsearch = '';
function quranErr() { toast('تعذر تحميل نص المصحف. أعد المحاولة.'); }
function renderQuran() {
  app.innerHTML = `
  ${brand()}
  ${pageTitle('القرآن الكريم', 'متابعة تلاوتك اليومية')}
  <main class="view wrap">
    <div id="contWrap"></div>
    <div class="search-box">${I.search}<input class="input" id="qsearchTop" type="search" placeholder="ابحث عن سورة أو آية" value="${esc(qsearch)}" autocomplete="off" aria-label="البحث في القرآن"></div>
    <div class="seg qseg" role="tablist" aria-label="فهرس المصحف">
      ${[['surah', 'السور'], ['juz', 'الأجزاء'], ['marks', 'العلامات'], ['search', 'بحث']].map(([k, l]) => `<button role="tab" type="button" data-t="${k}" aria-selected="${qtab === k}">${l}</button>`).join('')}
    </div>
    <section id="qbody"><div class="empty">جارٍ تحميل المصحف…</div></section>
  </main>`;
  const setTab = (k) => { qtab = k; LS.set('qtab', qtab); $$('.qseg button[data-t]').forEach((x) => x.setAttribute('aria-selected', String(x.dataset.t === k))); renderQBody(); };
  $$('.qseg button[data-t]').forEach((b) => b.onclick = () => setTab(b.dataset.t));
  let tm;
  $('#qsearchTop').addEventListener('input', (e) => {
    clearTimeout(tm);
    tm = setTimeout(() => { qsearch = e.target.value; if (qtab !== 'search' && qsearch.trim()) setTab('search'); else renderQBody(); }, 250);
  });
  loadQuran().then(() => {
    const r = lastRead || { s: 1, a: 1 };
    $('#contWrap').innerHTML = `<button class="cover" id="contBtn" type="button">${patternSvg()}<span class="c-ill">${ILL.rahl}</span><span class="c-text"><small>${lastRead ? 'متابعة القراءة' : 'ابدأ القراءة'}</small><b>سورة ${esc(surahName(r.s))}</b><span>الآية ${arNum(r.a)} · الجزء ${JUZ_NAMES[juzOf(r.s, r.a) - 1]}</span></span><span class="c-go">${I.next}</span></button>`;
    $('#contBtn').onclick = () => openSurah(r.s, r.a);
    renderQBody();
  }).catch(() => { $('#qbody').innerHTML = '<div class="empty">تعذر تحميل نص المصحف. تحقق من الاتصال ثم أعد فتح الصفحة.</div>'; });
}
const starBadge = (n) => `<span class="star">${STAR8}<em>${arNum(n)}</em></span>`;
function renderQBody() {
  const body = $('#qbody'); if (!body || !Q) return;
  if (qtab === 'surah') {
    body.innerHTML = `<ul class="list">${Q.map((s, i) => `<li><button type="button" data-s="${i + 1}">${starBadge(i + 1)}<span><span class="s-title">${esc(s[0])}</span><span class="s-meta">${ayahWord(s[2].length)} · ${s[1] === 'm' ? 'مكية' : 'مدنية'}</span></span><span class="chev">${I.next}</span></button></li>`).join('')}</ul>`;
  } else if (qtab === 'juz') {
    body.innerHTML = `<ul class="list">${JUZ.map(([s, a], i) => `<li><button type="button" data-s="${s}" data-a="${a}">${starBadge(i + 1)}<span style="min-width:0"><span class="s-title">الجزء ${JUZ_NAMES[i]}</span><span class="s-meta">${esc(Q[s - 1][0])}${a > 1 ? ` · من الآية ${arNum(a)}` : ''}</span></span><span class="chev">${I.next}</span></button></li>`).join('')}</ul>`;
  } else if (qtab === 'marks') {
    body.innerHTML = bookmarks.length
      ? `<div class="mark-list">${bookmarks.map((b, i) => `<div class="mark-card${i === 0 ? ' latest' : ''}"><button class="mk-open" type="button" data-s="${b.s}" data-a="${b.a}"><span class="mk-ic">${i === 0 ? I.markFill : I.mark}</span><span class="mk-body"><small>سورة ${esc(Q[b.s - 1][0])} · الآية ${arNum(b.a)}</small><b>${esc(Q[b.s - 1][2][b.a - 1].split(' ').slice(0, 7).join(' '))}${Q[b.s - 1][2][b.a - 1].split(' ').length > 7 ? '…' : ''}</b></span></button><button class="mk-del" type="button" data-del="${b.s}:${b.a}" aria-label="حذف العلامة">${I.close}</button></div>`).join('')}</div><p class="foot-note">احفظ موضعك للعودة إليه بسهولة</p>`
      : `<div class="empty">${I.mark}لا توجد علامات بعد.<br>المس أي آية أثناء القراءة واختر «إضافة علامة».</div>`;
  } else {
    const box = body;
    if (norm(qsearch).length < 2) { box.innerHTML = `<div class="empty">${I.search}اكتب في خانة البحث كلمة من حرفين على الأقل.<br>البحث لا يتأثر بالتشكيل ولا بالهمزات.</div>`; }
    else {
      // A surah name typed in the box jumps straight to that surah.
      const nq = norm(qsearch);
      const surahHits = Q.map((s, i) => [i + 1, s[0]]).filter(([, n]) => norm(n).includes(nq)).slice(0, 5);
      const res = searchQuran(qsearch);
      box.innerHTML = (surahHits.length ? `<ul class="list" style="margin-bottom:12px">${surahHits.map(([i, n]) => `<li><button type="button" data-s="${i}">${starBadge(i)}<span><span class="s-title">سورة ${esc(n)}</span><span class="s-meta">${ayahWord(Q[i - 1][2].length)}</span></span><span class="chev">${I.next}</span></button></li>`).join('')}</ul>` : '')
        + (res.length
          ? `<p class="foot-note top">نتائج البحث · ${res.length >= 150 ? 'أول ١٥٠' : arNum(res.length)}</p><div class="res-list">` + res.map(([s, a]) => `<button class="res-card" type="button" data-s="${s}" data-a="${a}"><span class="mk-body"><small>سورة ${esc(Q[s - 1][0])} · الآية ${arNum(a)}</small><b>${highlightSnippet(Q[s - 1][2][a - 1], qsearch)}</b></span><span class="open-l">فتح الآية ${I.next}</span></button>`).join('') + '</div>'
          : (surahHits.length ? '' : '<div class="empty">لا توجد نتائج مطابقة.</div>'));
    }
  }
  body.onclick = (e) => {
    const del = e.target.closest('[data-del]');
    if (del) { const [ds, da] = del.dataset.del.split(':').map(Number); toggleMark(ds, da); renderQBody(); toast('أزيلت العلامة'); return; }
    const b = e.target.closest('button[data-s]'); if (!b) return;
    openSurah(Number(b.dataset.s), Number(b.dataset.a || 1));
  };
}
/* Shows the words around the first match, with the matched words marked. */
function highlightSnippet(text, q) {
  const words = text.split(' ');
  const nw = words.map(norm);
  const nq = norm(q);
  const span = nq.split(' ').length;
  let hit = -1;
  for (let i = 0; i < nw.length && hit < 0; i++) if (nw.slice(i, i + span).join(' ').includes(nq)) hit = i;
  if (hit < 0) return esc(words.slice(0, 9).join(' ')) + (words.length > 9 ? '…' : '');
  const from = Math.max(0, hit - 3), to = Math.min(words.length, hit + span + 5);
  const out = words.slice(from, to).map((w, k) => {
    const i = from + k;
    return i >= hit && i < hit + span ? `<mark>${esc(w)}</mark>` : esc(w);
  }).join(' ');
  return (from > 0 ? '… ' : '') + out + (to < words.length ? ' …' : '');
}

/* ---------- Reader ---------- */
const reader = { open: false, s: 1, el: null, scrollT: 0 };
function openSurah(s, a = 1) {
  reader.s = s; reader.target = a;
  if (location.hash !== '#read') { location.hash = 'read'; } else { showReader(); }
}
/* Shared top of full-screen pages: brand mark and a title card. */
function readerTop(backId, title, sub, actions, extra) {
  return `<div class="reader-bar">${brand()}<div class="wrap"><div class="rcard">
      <button class="icon-btn" id="${backId}" type="button" aria-label="رجوع">${I.back}</button>
      <div class="ttl"><b>${title}</b><span id="${backId}Sub">${sub || ''}</span></div>
      <div class="r-act">${actions || ''}</div>
    </div>${extra || ''}</div></div>`;
}
function showReader() {
  if (!Q) { loadQuran().then(showReader).catch(quranErr); return; }
  if (!reader.el) {
    reader.el = document.createElement('div');
    reader.el.className = 'reader qreader';
    reader.el.innerHTML = readerTop('rBack', '<span id="rTitle"></span>', '', `
        <button class="icon-btn tf-toggle" id="rTafsir" type="button" aria-pressed="${!!S.tafsirMode}" aria-label="عرض التفسير الميسر">تفسير</button>
        <button class="icon-btn" id="rMark" type="button" aria-label="علامة على موضع القراءة">${I.mark}</button>
        <button class="icon-btn" id="rMenu" type="button" aria-label="إعدادات القراءة">${I.sliders}</button>`)
      + '<div class="reader-scroll" id="rScroll"><div class="wrap"><article class="page" id="rPage"></article></div></div>';
    document.body.appendChild(reader.el);
    $('#rBack').onclick = () => (history.length > 1 ? history.back() : (location.hash = 'quran'));
    $('#rMenu').onclick = readerMenu;
    $('#rTafsir').onclick = () => {
      const a = lastRead && lastRead.s === reader.s ? lastRead.a : 1;
      S.tafsirMode = !S.tafsirMode; save(); reader.target = a; drawSurah();
      toast(S.tafsirMode ? 'عرض التفسير الميسّر' : 'عرض المصحف');
    };
    $('#rMark').onclick = () => {
      const a = lastRead && lastRead.s === reader.s ? lastRead.a : 1;
      toggleMark(reader.s, a); syncReaderMark();
      const sp = $(`.ayah[data-a="${a}"]`); if (sp) sp.classList.toggle('marked', isMarked(reader.s, a));
      toast(isMarked(reader.s, a) ? `أضيفت علامة على الآية ${arNum(a)}` : 'أزيلت العلامة');
    };
    $('#rScroll').addEventListener('scroll', () => { clearTimeout(reader.scrollT); reader.scrollT = setTimeout(trackPosition, 350); }, { passive: true });
    $('#rPage').addEventListener('click', (e) => {
      const nx = e.target.closest('[data-go]'); if (nx) { reader.s = Number(nx.dataset.go); reader.target = 1; drawSurah(); return; }
      const ay = e.target.closest('.ayah'); if (ay) ayahSheet(reader.s, Number(ay.dataset.a));
    });
  }
  reader.open = true;
  document.body.classList.add('reading');
  document.body.style.overflow = 'hidden';
  drawSurah();
  renderPlayer();
}
function syncReaderMark() {
  const b = $('#rMark'); if (!b) return;
  const a = lastRead && lastRead.s === reader.s ? lastRead.a : 1;
  const on = isMarked(reader.s, a);
  b.innerHTML = on ? I.markFill : I.mark; b.setAttribute('aria-pressed', String(on));
}
function hideReader() {
  if (!reader.el) return;
  reader.el.remove(); reader.el = null; reader.open = false;
  document.body.classList.remove('reading');
  document.body.style.overflow = '';
  renderPlayer();
}
function cartouche(name) {
  return `<div class="cartouche"><svg viewBox="0 0 340 64" aria-hidden="true">
      <path d="M22 32L46 6H294L318 32L294 58H46Z" fill="var(--gold-soft)" stroke="currentColor" stroke-width="1.6"/>
      <path d="M33 32L52 12H288L307 32L288 52H52Z" fill="none" stroke="currentColor" stroke-width=".8"/>
      <g transform="translate(12 32)" fill="var(--paper)" stroke="currentColor" stroke-width="1.2"><rect x="-7" y="-7" width="14" height="14"/><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)"/></g>
      <g transform="translate(328 32)" fill="var(--paper)" stroke="currentColor" stroke-width="1.2"><rect x="-7" y="-7" width="14" height="14"/><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)"/></g>
    </svg><b>سورة ${esc(name)}</b></div>`;
}
function drawSurah() {
  const s = reader.s;
  const [name, type, verses] = Q[s - 1];
  $('#rTitle').textContent = `سورة ${name}`;
  $('#rBackSub').textContent = `الجزء ${JUZ_NAMES[juzOf(s, reader.target || 1) - 1]}`;
  const juzStarts = {};
  JUZ.forEach(([js, ja], i) => { if (js === s && i > 0) juzStarts[ja] = i + 1; });
  let html = corners();
  html += cartouche(name);
  html += `<div class="surah-meta">${type === 'm' ? 'مكية' : 'مدنية'} · ${ayahWord(verses.length)} · ترتيبها في المصحف ${arNum(s)}</div>`;
  if (s !== 1 && s !== 9) html += '<p class="basmala">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>';
  const tfOn = S.tafsirMode && TF;
  if (S.tafsirMode && !TF) loadTafsir().then(() => { if (reader.open && reader.s === s) drawSurah(); }).catch(() => toast('تعذر تحميل التفسير.'));
  const rb = $('#rTafsir'); if (rb) rb.setAttribute('aria-pressed', String(!!S.tafsirMode));
  if (tfOn) {
    html += '<div class="tf-list">' + verses.map((v, i) => {
      const a = i + 1;
      const jm = juzStarts[a] ? `<span class="juz-mark">الجزء ${JUZ_NAMES[juzStarts[a] - 1]}</span>` : '';
      return `${jm}<article class="tf-block"><p class="tf-ayah"><span class="ayah${isMarked(s, a) ? ' marked' : ''}" data-a="${a}">${esc(v)}<span class="an">۝${arNum(a)}</span></span></p><div class="tf-text">${tafsirHtml(TF[s - 1][i])}</div></article>`;
    }).join('') + '</div>';
  } else {
    html += '<div class="mushaf">' + verses.map((v, i) => {
      const a = i + 1;
      const jm = juzStarts[a] ? `<span class="juz-mark">الجزء ${JUZ_NAMES[juzStarts[a] - 1]}</span>` : '';
      return `${jm}<span class="ayah${isMarked(s, a) ? ' marked' : ''}" data-a="${a}">${esc(v)}<span class="an">۝${arNum(a)}</span></span> `;
    }).join('') + '</div>';
  }
  if (tfOn) html += '<p class="about">التفسير الميسّر، مجمع الملك فهد لطباعة المصحف الشريف.</p>';
  html += '<nav class="page-nav">';
  if (s < 114) html += `<button class="btn primary" type="button" data-go="${s + 1}">${esc(Q[s][0])} ${I.next}</button>`;
  if (s > 1) html += `<button class="btn" type="button" data-go="${s - 1}">${I.prev} ${esc(Q[s - 2][0])}</button>`;
  html += '</nav>';
  $('#rPage').innerHTML = html;
  const sc = $('#rScroll');
  const tgt = reader.target > 1 ? $(`.ayah[data-a="${reader.target}"]`) : null;
  if (tgt) {
    requestAnimationFrame(() => { tgt.scrollIntoView({ block: 'center' }); tgt.classList.add('flash'); setTimeout(() => tgt.classList.remove('flash'), 1600); });
  } else sc.scrollTop = 0;
  setLastRead(s, reader.target || 1);
  markPlaying();
}
function trackPosition() {
  if (!reader.open) return;
  const sc = $('#rScroll'); const r = sc.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(160, r.height / 3));
  const ay = el && el.closest && el.closest('.ayah');
  if (ay) { const a = Number(ay.dataset.a); setLastRead(reader.s, a); $('#rBackSub').textContent = `الجزء ${JUZ_NAMES[juzOf(reader.s, a) - 1]} · الآية ${arNum(a)}`; }
}
function setLastRead(s, a) { lastRead = { s, a }; LS.set('lastRead', lastRead); syncReaderMark(); }
function ayahSheet(s, a) {
  const text = Q[s - 1][2][a - 1];
  const marked = isMarked(s, a);
  sheet(`<h3>سورة ${esc(Q[s - 1][0])} · الآية ${arNum(a)}</h3>
    <div class="quote">${esc(text)}</div>
    <div class="tf-sheet" id="aTafsirBox" hidden></div>
    <div class="actions">
      <button id="aTafsir" type="button">${I.book} التفسير الميسّر</button>
      <button id="aPlay" type="button">${I.play} الاستماع من هذه الآية</button>
      <button id="aMark" type="button">${I.mark} ${marked ? 'إزالة العلامة' : 'إضافة علامة'}</button>
      <button id="aCopy" type="button">${I.copy} نسخ الآية</button>
    </div>`, (el) => {
    $('#aPlay', el).onclick = () => { closeSheet(); playAyah(s, a); };
    $('#aTafsir', el).onclick = () => {
      const box = $('#aTafsirBox', el);
      if (!box.hidden) { box.hidden = true; return; }
      box.hidden = false; box.innerHTML = '<p class="muted">جارٍ تحميل التفسير…</p>';
      loadTafsir().then(() => { box.innerHTML = `<h4>التفسير الميسّر</h4>${tafsirHtml(TF[s - 1][a - 1])}`; box.scrollIntoView({ block: 'nearest' }); })
        .catch(() => { box.innerHTML = '<p class="muted">تعذر تحميل التفسير.</p>'; });
    };
    $('#aMark', el).onclick = () => {
      toggleMark(s, a); closeSheet();
      const sp = $(`.ayah[data-a="${a}"]`); if (sp) sp.classList.toggle('marked', isMarked(s, a));
      toast(isMarked(s, a) ? 'أضيفت العلامة' : 'أزيلت العلامة');
    };
    $('#aCopy', el).onclick = () => {
      const t = `${text} ﴿${Q[s - 1][0]}: ${arNum(a)}﴾`;
      const done = () => { closeSheet(); toast('نُسخت الآية'); };
      try { navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done)); } catch (e) { fallbackCopy(t, done); }
    };
  });
}
function fallbackCopy(t, done) {
  const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('حدد النص وانسخه يدويًا'); }
  ta.remove();
}
function readerMenu() {
  sheet(`<h3>إعدادات القراءة</h3>
    <div class="group" style="box-shadow:none;background:var(--surface-2)">
      <div class="row plain"><div class="r-body"><b>حجم الخط</b><small>يُحفظ تلقائيًا</small></div>
        <div class="stepper"><button type="button" id="fsMinus" aria-label="تصغير الخط">${I.minus}</button><output id="fsOut">${S.qsize}</output><button type="button" id="fsPlus" aria-label="تكبير الخط">${I.plus}</button></div></div>
      <div class="row plain"><div class="r-body"><b>القارئ</b></div><select class="input" id="recSel" aria-label="القارئ">${RECITERS.map((r) => `<option value="${r[0]}" ${r[0] === S.reciter ? 'selected' : ''}>${r[1]}</option>`).join('')}</select></div>
      <div class="row plain"><div class="r-body"><b>التفسير الميسّر تحت كل آية</b><small>يعمل دون إنترنت</small></div><label class="switch"><input type="checkbox" id="tfMode" ${S.tafsirMode ? 'checked' : ''} aria-label="عرض التفسير الميسر"><span></span></label></div>
      <div class="row plain"><div class="r-body"><b>تلاوة السورة كاملة</b><small>آية بعد آية من البداية</small></div><button class="btn primary small" id="playAll" type="button">${I.play} تشغيل</button></div>
    </div>`,
  (el) => {
    const upd = (d) => { S.qsize = Math.min(48, Math.max(20, S.qsize + d)); save(); applyTheme(); $('#fsOut', el).textContent = S.qsize; };
    $('#fsMinus', el).onclick = () => upd(-2);
    $('#fsPlus', el).onclick = () => upd(2);
    $('#recSel', el).onchange = (e) => { S.reciter = e.target.value; save(); if (P.s) playAyah(P.s, P.a); };
    $('#playAll', el).onclick = () => { closeSheet(); playAyah(reader.s, 1); };
    $('#tfMode', el).onchange = (e) => { S.tafsirMode = e.target.checked; save(); closeSheet(); drawSurah(); };
  });
}

/* ---------- Qibla ---------- */
function dialSvg(bearing) {
  let ticks = '';
  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0;
    ticks += `<line x1="150" y1="${major ? 30 : 34}" x2="150" y2="${major ? 44 : 40}" transform="rotate(${d} 150 150)" stroke="${major ? 'var(--emerald)' : 'var(--gold)'}" stroke-width="${major ? 2.4 : 1.2}" stroke-linecap="round"/>`;
  }
  const labels = [['شمال', 0], ['شرق', 90], ['جنوب', 180], ['غرب', 270]].map(([t, d]) =>
    `<text x="${(150 + 86 * Math.sin(rad(d))).toFixed(1)}" y="${(156 - 86 * Math.cos(rad(d))).toFixed(1)}" text-anchor="middle" font-size="17" font-weight="700" fill="var(--ink)" font-family="var(--f-display)">${t}</text>`).join('');
  let rose = '';
  for (let k = 0; k < 4; k++) {
    rose += `<g transform="rotate(${k * 90} 150 150)"><path d="M150 150L150 86L159 141Z" fill="var(--emerald)"/><path d="M150 150L150 86L141 141Z" fill="var(--paper)" stroke="var(--emerald)" stroke-width=".8"/></g>`;
    rose += `<g transform="rotate(${k * 90 + 45} 150 150)"><path d="M150 150L150 112L155 145Z" fill="var(--gold)"/><path d="M150 150L150 112L145 145Z" fill="var(--gold-soft)"/></g>`;
  }
  return `<svg viewBox="0 0 300 300" aria-hidden="true">
    <circle cx="150" cy="150" r="146" fill="var(--paper)" stroke="var(--gold)" stroke-width="5"/>
    <circle cx="150" cy="150" r="136" fill="none" stroke="var(--gold-2)" stroke-width="1.2"/>
    ${ticks}${labels}
    <g opacity=".85">${rose}</g>
    <g transform="rotate(${bearing} 150 150)">
      <path d="M150 150L144 92 150 66 156 92Z" fill="var(--emerald)"/>
      <circle cx="150" cy="50" r="18" fill="#141414" stroke="var(--gold)" stroke-width="2.2"/>
      <path d="M141 46l9-5 9 5v10l-9 4-9-4z" fill="#2a2a2a" stroke="#e2c27c" stroke-width="1"/><path d="M141 49l9 4 9-4" fill="none" stroke="#e2c27c" stroke-width="1.6"/>
    </g>
    <circle cx="150" cy="150" r="11" fill="url(#gGold)" stroke="#9c7631" stroke-width="1"/><circle cx="150" cy="150" r="4" fill="#fff6dd"/>
  </svg>`;
}
function renderQibla() {
  const b = qiblaBearing();
  const dist = distKm(S.loc, KAABA);
  const place = [S.loc.name, S.loc.region || S.loc.country].filter(Boolean).join('، ');
  app.innerHTML = `
  ${brand()}
  <div class="ptitle wrap"><h1 class="ruled">اتجاه القبلة</h1></div>
  <main class="view wrap qibla">
    <button class="loc-pill center" id="qPlace" type="button">${I.pin}<span>${esc(place)}</span>${I.chevDown}</button>
    <section class="q-arch">
      <svg class="q-arch-line" viewBox="0 0 400 420" preserveAspectRatio="none" aria-hidden="true"><path d="M8 420V170C8 110 60 80 130 62 178 50 190 30 200 8c10 22 22 42 70 54 70 18 122 48 122 108v250" fill="none" stroke="var(--gold-2)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>
      <span class="q-pill">اتجاه القبلة</span>
      <div class="compass" id="compass">
        <svg class="lubber" viewBox="0 0 24 30" aria-hidden="true"><path d="M12 30L2 4Q12 -2 22 4Z" fill="currentColor"/></svg>
        <div class="glow"></div>
        <div class="dial" id="dial">${dialSvg(b)}</div>
      </div>
    </section>
    <p class="q-cap">زاوية القبلة</p>
    <div class="q-deg">${Math.round(b)}°</div>
    <p class="q-sub">من الشمال الجغرافي، مع اتجاه عقارب الساعة</p>
    <div class="q-hint" id="qHint"></div>
    <button class="btn primary" id="startCompass" type="button" hidden>${I.compass} تشغيل البوصلة</button>
    <div class="facts">
      <div>${I.phone}<span>اتجاه الهاتف</span><b id="headingOut">—</b><small id="headState">ينتظر المستشعر</small></div>
      <div>${I.kaaba}<span>إلى الكعبة</span><b>${Math.round(dist).toLocaleString('en')} كم</b></div>
      <div>${I.compass}<span>زاوية القبلة</span><b>${Math.round(b)}°</b></div>
    </div>
    <p class="tip">${I.phone}<span>ضع الهاتف مسطّحًا بعيدًا عن المعادن والمغناطيس.</span></p>
    <button class="btn primary wide" id="calib" type="button">${I.gps} معايرة البوصلة</button>
  </main>`;
  $('#qPlace').onclick = () => { location.hash = 'prefs-loc'; };
  $('#startCompass').onclick = () => startCompass(b, true);
  $('#calib').onclick = () => sheet(`<h3>معايرة البوصلة</h3>
    <svg class="calib-art" viewBox="0 0 200 110" aria-hidden="true"><path d="M100 55c-20-30-70-30-70 0s50 30 70 0 70-30 70 0-50 30-70 0" fill="none" stroke="var(--gold)" stroke-width="3" stroke-dasharray="6 6"/><rect x="88" y="34" width="24" height="42" rx="5" fill="var(--emerald)"/><rect x="92" y="39" width="16" height="30" rx="2" fill="var(--paper)"/></svg>
    <ol class="steps"><li>أمسك الهاتف وحرّكه في الهواء على شكل الرقم 8، ثلاث مرات أو أكثر.</li><li>ابتعد عن الأجهزة الكهربائية والمعادن والمغناطيس (غطاء الهاتف المغناطيسي أيضًا).</li><li>ضع الهاتف مسطّحًا، وانتظر حتى يستقر الاتجاه.</li></ol>`);
  startCompass(b, false);
}

/* ---------- Month timetable ---------- */
let monthOffset = 0;
function renderMonth() {
  const base = ymd(new Date(), S.loc.tz);
  let y = base.y, m = base.m + monthOffset;
  while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; }
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthName = new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 15)));
  const wd = new Intl.DateTimeFormat('ar', { weekday: 'short', timeZone: 'UTC' });
  const isThis = y === base.y && m === base.m;
  const focusDay = isThis ? base.d : 1;
  const start = Math.max(1, Math.min(focusDay - 3, days - 6));
  const strip = Array.from({ length: Math.min(7, days) }, (_, i) => start + i).map((d) => {
    const dt = new Date(Date.UTC(y, m - 1, d));
    return `<button type="button" data-day="${d}" aria-pressed="${isThis && d === base.d}"><small>${esc(wd.format(dt))}</small><b>${d}</b></button>`;
  }).join('');
  let rows = '';
  for (let d = 1; d <= days; d++) {
    const t = { y, m, d };
    const tt = dayTimes(t);
    const today = isThis && d === base.d;
    rows += `<tr id="md-${d}" class="${today ? 'today' : ''} ${isFriday(t) ? 'fri' : ''}"><td><b>${d}</b>${today ? '<small>اليوم</small>' : `<small>${esc(wd.format(new Date(Date.UTC(y, m - 1, d))))}</small>`}</td>${PRAYERS.map((p) => `<td>${esc(fmtTime(tt[p.key]))}</td>`).join('')}</tr>`;
  }
  const place = [S.loc.name, S.loc.region || S.loc.country].filter(Boolean).join('، ');
  app.innerHTML = `
  ${brand()}
  <div class="ptitle wrap"><h1 class="ruled">جدول الشهر</h1></div>
  <main class="view wrap month-view">
    <button class="loc-pill center" id="mPlace" type="button">${I.pin}<span>${esc(place)}</span>${I.chevDown}</button>
    <div class="m-head">
      <div class="m-bar"><button type="button" id="mPrev" aria-label="الشهر السابق">${I.prev}</button><b>${esc(monthName)}</b><button type="button" id="mNext" aria-label="الشهر التالي">${I.next}</button></div>
      <button class="m-today" type="button" id="mToday" aria-label="الشهر الحالي">${I.cal}</button>
    </div>
    <div class="m-strip">${strip}</div>
    <section class="m-table"><div class="table-wrap"><table class="month"><thead><tr><th>اليوم</th>${PRAYERS.map((p) => `<th>${p.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>
    <p class="tip quiet">${I.info}<span>المواقيت حسب طريقة الحساب المختارة: ${esc(METHODS[S.method].label)}</span></p>
  </main>`;
  $('#mPlace').onclick = () => { location.hash = 'prefs-loc'; };
  $('#mPrev').onclick = () => { monthOffset--; renderMonth(); };
  $('#mNext').onclick = () => { monthOffset++; renderMonth(); };
  $('#mToday').onclick = () => { monthOffset = 0; renderMonth(); };
  $('.m-strip').onclick = (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    $$('.m-strip button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const r = $('#md-' + b.dataset.day); if (r) { centerRow(r, true); r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); }
  };
  // Scroll only the table, so the page header stays in view.
  function centerRow(r, smooth) { const box = $('.m-table'); if (!box) return; box.scrollTo({ top: r.offsetTop - box.clientHeight / 2 + r.offsetHeight / 2, behavior: smooth ? 'smooth' : 'auto' }); }
  if (isThis) { const r = $('#md-' + base.d); if (r && base.d > 6) requestAnimationFrame(() => centerRow(r, false)); }
}
function openMonth() { monthOffset = 0; location.hash = 'month'; }

function startCompass(bearing, fromTap) {
  const btn = $('#startCompass'); const hint = $('#qHint');
  if (compassCleanup) { compassCleanup(); compassCleanup = null; }
  let got = false, cum = null, last = null, sx = 0, sy = 0, wasAligned = false, calibrate = false;
  const show = (hd) => {
    sx = sx * 0.75 + Math.cos(rad(hd)) * 0.25; sy = sy * 0.75 + Math.sin(rad(hd)) * 0.25;
    const sm = (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360;
    if (last == null) { cum = sm; } else { cum += ((sm - last + 540) % 360) - 180; }
    last = sm;
    if (!got) { got = true; if (btn) btn.hidden = true; }
    const hs = $('#headState'); if (hs) hs.textContent = calibrate ? 'يحتاج معايرة' : 'مستقر';
    const dial = $('#dial'); if (!dial) return;
    dial.style.transform = `rotate(${-cum}deg)`;
    $('#headingOut').textContent = Math.round(sm) + '°';
    const diff = ((bearing - sm + 540) % 360) - 180;
    const aligned = Math.abs(diff) < 4;
    $('#compass').classList.toggle('aligned', aligned);
    hint.classList.toggle('ok', aligned);
    hint.textContent = aligned ? 'أنت متجه إلى القبلة'
      : (diff > 0 ? `استدر يمينًا ${Math.round(diff)}°` : `استدر يسارًا ${Math.round(-diff)}°`)
        + (calibrate ? ' · البوصلة تحتاج إلى معايرة: حرّك الهاتف على شكل 8' : '');
    if (aligned && !wasAligned && navigator.vibrate) navigator.vibrate(60);
    wasAligned = aligned;
  };
  let wake = null;
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } catch (e) { /* ignore */ }
  const noSensor = () => {
    if (got) return;
    hint.textContent = 'لم يُعثر على مستشعر بوصلة في هذا الجهاز. استخدم الزاوية المعروضة مع بوصلة أخرى.';
    const hs = $('#headState'); if (hs) hs.textContent = 'غير متوفر';
    if (btn) btn.hidden = false;
  };
  hint.textContent = 'جارٍ قراءة البوصلة…';

  // Android app: the phone's own sensors, corrected to true north.
  if (NATIVE && NATIVE.startCompass) {
    window.__mihrabHeading = (deg, accuracy) => { calibrate = accuracy < 2; show(deg); };
    let ok = false;
    try { ok = NATIVE.startCompass(S.loc.lat, S.loc.lng); } catch (e) { ok = false; }
    const to = setTimeout(noSensor, 3000);
    if (!ok) noSensor();
    compassCleanup = () => { try { NATIVE.stopCompass(); } catch (e) { /* ignore */ } window.__mihrabHeading = null; clearTimeout(to); if (wake) wake.release().catch(() => {}); };
    return;
  }

  // Browser
  if (typeof DeviceOrientationEvent === 'undefined') { hint.textContent = 'هذا المتصفح لا يدعم مستشعر الاتجاه.'; return; }
  const needsTap = typeof DeviceOrientationEvent.requestPermission === 'function';
  const begin = () => {
    const evName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
    const onO = (e) => {
      let hd = null;
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) hd = e.webkitCompassHeading;
      else if ((e.absolute || evName === 'deviceorientationabsolute') && e.alpha != null) hd = 360 - e.alpha;
      if (hd == null) return;
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      show((hd + so + 360) % 360);
    };
    window.addEventListener(evName, onO);
    const to = setTimeout(noSensor, 3000);
    compassCleanup = () => { window.removeEventListener(evName, onO); clearTimeout(to); if (wake) wake.release().catch(() => {}); };
  };
  if (needsTap && !fromTap) {
    // Some browsers grant this without a tap; iPhone asks only after one.
    DeviceOrientationEvent.requestPermission().then((r) => {
      if (r === 'granted') begin(); else throw new Error(r);
    }).catch(() => {
      hint.textContent = 'اضغط «تشغيل البوصلة» للسماح باستعمال مستشعر الاتجاه.';
      if (btn) btn.hidden = false;
    });
    return;
  }
  if (needsTap) {
    DeviceOrientationEvent.requestPermission().then((r) => { if (r === 'granted') begin(); else hint.textContent = 'لم يُسمح بالوصول إلى مستشعر الاتجاه. فعّله من إعدادات المتصفح.'; })
      .catch(() => { hint.textContent = 'تعذر طلب إذن المستشعر.'; });
  } else begin();
}

/* ---------- Location lookup ---------- */

/* Municipality name for a position (OpenStreetMap). Cached; the city list is the offline fallback. */
const nativeWaits = {};
let nativeSeq = 0;
window.__mihrabResolve = (id, ok, payload) => {
  const w = nativeWaits[id]; if (!w) return;
  delete nativeWaits[id];
  if (ok) w.res(payload); else w.rej(new Error(payload || 'native error'));
};
function nativeHttpGet(url) {
  return new Promise((res, rej) => {
    const id = 'n' + (++nativeSeq);
    nativeWaits[id] = { res, rej };
    setTimeout(() => { if (nativeWaits[id]) { delete nativeWaits[id]; rej(new Error('timeout')); } }, 15000);
    NATIVE.httpGet(id, url);
  });
}
async function placeName(lat, lng) {
  const k = lat.toFixed(3) + ',' + lng.toFixed(3);
  const cache = LS.get('geo', {});
  if (cache[k]) return cache[k];
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=10&addressdetails=1&accept-language=ar`;
  let j;
  if (NATIVE && NATIVE.httpGet) j = JSON.parse(await nativeHttpGet(url));
  else { const r = await fetch(url); if (!r.ok) throw new Error('geo ' + r.status); j = await r.json(); }
  const a = j.address || {};
  const local = j.name || a.suburb || a.city || a.town || a.village || a.municipality;
  if (!local) throw new Error('no name');
  const dz = a.country_code === 'dz';
  let region = a.state || a.region || '';
  if (dz && region && !/^ولاية/.test(region)) region = 'ولاية ' + region;
  const res = { name: dz && !/^بلدية/.test(local) ? 'بلدية ' + local : local, region, country: a.country || '' };
  const keys = Object.keys(cache); if (keys.length > 30) delete cache[keys[0]];
  cache[k] = res; LS.set('geo', cache);
  return res;
}
function locate(silent) {
  if (!navigator.geolocation) { if (!silent) toast('تحديد الموقع غير متاح في هذا المتصفح. اختر مدينتك من القائمة.'); return; }
  if (!silent) toast('جارٍ تحديد موقعك…', 8000);
  navigator.geolocation.getCurrentPosition((p) => {
    const lat = p.coords.latitude, lng = p.coords.longitude;
    if (silent && S.loc.gps && distKm(S.loc, { lat, lng }) < 2 && S.loc.region) return;
    const near = nearestCity(lat, lng);
    let name = 'موقعي الحالي';
    if (near && near.d < 35) name = near.c[0];
    else if (near && near.d < 150) name = `قرب ${near.c[0]}`;
    if (!S.methodManual && near && near.d < 600) S.method = near.c[5];
    setLoc({ lat, lng, name, country: near && near.d < 600 ? near.c[1] : '', tz: deviceTz, auto: false, gps: true }, true);
    route(true);
    placeName(lat, lng).then((pl) => {
      if (S.loc.lat !== lat || S.loc.lng !== lng) return;
      S.loc = Object.assign({}, S.loc, { name: pl.name, region: pl.region, country: pl.country });
      save(); route(true);
      if (!silent) toast(`موقعك: ${pl.name}${pl.region ? '، ' + pl.region : ''}`, 4000);
    }).catch(() => { if (!silent) toast(`الموقع: ${name}`); });
  }, (err) => {
    if (silent) return;
    toast(err.code === 1 ? 'لم يُسمح بالوصول إلى الموقع. اختر مدينتك من الإعدادات.' : 'تعذر تحديد الموقع. حاول مجددًا أو اختر مدينتك.', 4000);
  }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 10 * 60 * 1000 });
}
/* ---------- Settings ---------- */
const APP_VERSION = '1.4';
function setLoc(loc, quiet) {
  S.loc = loc; save(); fmtCacheClear();
  if (!quiet) toast(`الموقع: ${loc.name}`);
}
function fmtCacheClear() { for (const k of Object.keys(fmtCache)) delete fmtCache[k]; }
function pickerSheet(title, options, value, onPick) {
  sheet(`<h3>${esc(title)}</h3><div class="pick">${options.map(([v, l, sub]) => `<button type="button" data-v="${esc(v)}" aria-pressed="${String(v) === String(value)}"><span><b>${esc(l)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="tick-ic">${I.check}</span></button>`).join('')}</div>`, (el) => {
    $('.pick', el).onclick = (e) => { const b = e.target.closest('[data-v]'); if (!b) return; closeSheet(); onPick(b.dataset.v); };
    const sel = $('.pick [aria-pressed="true"]', el); if (sel) sel.scrollIntoView({ block: 'center' });
  });
}
const sw = (id, on, label) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;
const segH = (name, val, opts) => `<div class="seg" role="group" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${String(val) === String(v)}">${l}</button>`).join('')}</div>`;
function prefsHead(sub) {
  return `${brand()}
  <div class="ptitle wrap"><h1 class="ruled">الإعدادات <span class="gear">${I.gear}</span></h1></div>
  ${sub ? `<div class="wrap sub-banner-row"><button class="icon-btn" id="prefsBack" type="button" aria-label="رجوع إلى الإعدادات">${I.back}</button><p class="verse-banner small">${SPARK}<span>${sub}</span>${SPARK}</p></div>` : ''}`;
}
function bindSegs(root) {
  $$('[data-seg]', root).forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    const name = g.dataset.seg; let v = b.dataset.v;
    if (name === 'h24') v = v === 'true';
    S[name] = v; save();
    $$('button', g).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (name === 'theme') applyTheme();
    if (name === 'h24') fmtCacheClear();
  }));
}
function themeArt(kind) {
  const mosque = (c, d) => `<g fill="${c}"><path d="M30 46c0-11 8-17 15-20 7 3 15 9 15 20z"/><rect x="28" y="45" width="34" height="13"/><rect x="18" y="26" width="4" height="32"/><rect x="68" y="26" width="4" height="32"/><path d="M17.5 27l2.5-7 2.5 7zM67.5 27l2.5-7 2.5 7z"/></g><path d="M41 58v-6a4 4 0 0 1 8 0v6z" fill="${d}"/>`;
  if (kind === 'light') return `<svg viewBox="0 0 90 64" aria-hidden="true"><rect width="90" height="64" rx="10" fill="#F7F4EC"/><circle cx="45" cy="16" r="4" fill="#E2C27C"/>${mosque('#1F6A52', '#F7F4EC')}</svg>`;
  if (kind === 'dark') return `<svg viewBox="0 0 90 64" aria-hidden="true"><rect width="90" height="64" rx="10" fill="#0D3A2F"/><circle cx="62" cy="14" r="5" fill="#E2C27C"/><circle cx="64.5" cy="12.5" r="4.2" fill="#0D3A2F"/>${mosque('#5CBB9C', '#0D3A2F')}</svg>`;
  return `<svg viewBox="0 0 90 64" aria-hidden="true"><defs><clipPath id="thHalf"><rect x="45" width="45" height="64"/></clipPath></defs><rect width="90" height="64" rx="10" fill="#F7F4EC"/>${mosque('#1F6A52', '#F7F4EC')}<g clip-path="url(#thHalf)"><rect width="90" height="64" rx="10" fill="#0D3A2F"/>${mosque('#5CBB9C', '#0D3A2F')}</g><circle cx="66" cy="14" r="4" fill="#E2C27C"/></svg>`;
}
function renderPrefs() {
  const place = [S.loc.name, S.loc.region || S.loc.country].filter(Boolean).join('، ');
  const rec = (RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0])[1];
  const link = (href, icon, title, sub) => `<a class="srow" href="#${href}">${icon}<span class="r-body"><b>${title}</b><small>${esc(sub)}</small></span><span class="chev">${I.next}</span></a>`;
  app.innerHTML = `
  ${prefsHead('')}
  <main class="view wrap prefs">
    <section class="app-card"><span class="app-ic">${LOGO}</span><span><b>مِحراب</b><small>الإصدار ${APP_VERSION}</small></span></section>
    ${link('prefs-loc', I.pin, 'الموقع', place)}
    ${link('prefs-loc', I.scale, 'طريقة الحساب', METHODS[S.method].label)}
    ${link('prefs-adhan', I.bellOn, 'الأذان والتنبيهات', 'الصوت، التذكير ومواقيت الأذان')}
    <section class="scard"><div class="scard-h">${BEADS}<b>تذكير الأذكار</b></div>
      <div class="two-sw"><label>${sw('remAm', S.remindMorning, 'تذكير أذكار الصباح')}<span>الصباح</span></label><label>${sw('remPm', S.remindEvening, 'تذكير أذكار المساء')}<span>المساء</span></label></div></section>
    <section class="scard"><a class="scard-h" href="#prefs-look">${ICONS.isha}<b>المظهر والتلاوة</b><span class="chev">${I.next}</span></a>
      <div class="theme-mini">${[['light', 'فاتح', ICONS.dhuhr], ['dark', 'داكن', ICONS.isha], ['auto', 'تلقائي', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></svg>']].map(([v, l, ic]) => `<button type="button" data-theme-v="${v}" aria-pressed="${S.theme === v}">${ic}<span>${l}</span></button>`).join('')}</div></section>
    <section class="scard list-card">
      ${link('prefs-look', I.headset, 'القارئ', rec)}
      ${link('prefs-look', I.clock, 'تنسيق الوقت', S.h24 ? '24 ساعة' : '12 ساعة')}
    </section>
    <p class="about">مِحراب · تُحسب المواقيت على جهازك بمكتبة Adhan (MIT). نص المصحف برواية حفص من مشروع Tanzil (CC BY-SA 4.0) بخط «أميري قرآن». التفسير الميسّر لمجمع الملك فهد. الأذكار من «حصن المسلم» (asellam/HisnElMuslim، MIT). تسجيلات الأذان من Wikimedia Commons (CC0 و CC BY-SA 4.0). أسماء البلديات من OpenStreetMap. التلاوات من Islamic Network وتحتاج إلى إنترنت.</p>
  </main>`;
  $('#remAm').onchange = (e) => { S.remindMorning = e.target.checked; save(); };
  $('#remPm').onchange = (e) => { S.remindEvening = e.target.checked; save(); };
  $('.theme-mini').onclick = (e) => {
    const b = e.target.closest('[data-theme-v]'); if (!b) return;
    S.theme = b.dataset.themeV; save(); applyTheme();
    $$('.theme-mini button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  };
}
function renderPrefsLoc() {
  const quick = () => CITIES.filter((c) => c[1] === (S.loc.country || 'الجزائر')).slice(0, 6);
  const cityRows = (list) => list.map((c) => `<button type="button" data-i="${CITIES.indexOf(c)}">${I.pin}<span><b>${esc(c[0])}</b><small>${esc(c[1])}</small></span><span class="chev">${I.next}</span></button>`).join('');
  app.innerHTML = `
  ${prefsHead('الموقع وطريقة الحساب')}
  <main class="view wrap prefs">
    <section class="loc-card"><span class="loc-ill">${ILL.prayer}</span><span class="r-body"><b>${I.pin} ${esc([S.loc.name, S.loc.region || S.loc.country].filter(Boolean).join('، '))}</b><small>${S.loc.gps ? 'موقعك الحالي' : S.loc.auto ? 'مدينة افتراضية' : 'مدينة مختارة'}</small></span><button class="btn small primary" id="gpsBtn" type="button">${I.gps} تحديد موقعي</button></section>
    <div class="search-box">${I.search}<input class="input" id="citySearch" type="search" placeholder="ابحث عن مدينة" autocomplete="off" aria-label="البحث عن مدينة"></div>
    <div class="city-list" id="cityResults">${cityRows(quick())}</div>
    <section class="scard">
      <button class="srow" id="methodRow" type="button">${I.scale}<span class="r-body"><b>طريقة الحساب</b><small>${esc(METHODS[S.method].label)}</small></span><span class="chev">${I.next}</span></button>
      <div class="srow static">${ICONS.asr}<span class="r-body"><b>وقت العصر</b><small>الجمهور: ظل المثل · الحنفية: ظل المثلين</small></span></div>
      ${segH('madhab', S.madhab, [['shafi', 'الجمهور'], ['hanafi', 'الحنفي']])}
      <button class="srow" id="hlRow" type="button">${I.globe}<span class="r-body"><b>خطوط العرض العليا</b><small>${{ auto: 'تلقائي', middleofthenight: 'منتصف الليل', seventhofthenight: 'سُبع الليل', twilightangle: 'زاوية الشفق' }[S.highLat]}</small></span><span class="chev">${I.next}</span></button>
    </section>
    <section class="scard">
      <div class="srow static">${I.sliders}<span class="r-body"><b>تعديل المواقيت بالدقائق</b><small>لمطابقة توقيت مسجدك</small></span></div>
      <div class="offsets">${PRAYERS.map((p) => `<div><span class="o-ic">${ICONS[p.key]}</span><span>${p.name}</span><div class="stepper"><button type="button" data-off="${p.key}" data-d="1" aria-label="إضافة دقيقة إلى ${p.name}">${I.plus}</button><output id="off-${p.key}">${S.offsets[p.key] > 0 ? '+' : ''}${S.offsets[p.key]}</output><button type="button" data-off="${p.key}" data-d="-1" aria-label="إنقاص دقيقة من ${p.name}">${I.minus}</button></div></div>`).join('')}</div>
      <div class="srow static">${I.cal}<span class="r-body"><b>تعديل التاريخ الهجري</b><small>حسب رؤية الهلال في بلدك</small></span>
        <div class="stepper"><button type="button" id="hjPlus" aria-label="يوم أكثر">${I.plus}</button><output id="hjOut">${S.hijriAdj > 0 ? '+' : ''}${S.hijriAdj}</output><button type="button" id="hjMinus" aria-label="يوم أقل">${I.minus}</button></div></div>
    </section>
  </main>`;
  $('#prefsBack').onclick = () => (history.length > 1 ? history.back() : (location.hash = 'prefs'));
  $('#gpsBtn').onclick = () => locate();
  const cs = $('#citySearch'), cr = $('#cityResults');
  cs.addEventListener('input', () => {
    const q = cs.value.trim();
    const res = q ? CITIES.filter((c) => c[0].includes(q) || c[1].includes(q)).slice(0, 30) : quick();
    cr.innerHTML = res.length ? cityRows(res) : '<div class="empty">لا توجد مدينة بهذا الاسم. استخدم «تحديد موقعي».</div>';
  });
  cr.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    const c = CITIES[Number(b.dataset.i)];
    if (!S.methodManual) S.method = c[5];
    setLoc({ lat: c[2], lng: c[3], name: c[0], country: c[1], region: '', tz: c[4], auto: false });
    renderPrefsLoc();
  });
  $('#methodRow').onclick = () => pickerSheet('طريقة الحساب', Object.entries(METHODS).map(([k, m]) => [k, m.label]), S.method, (v) => { S.method = v; S.methodManual = true; save(); renderPrefsLoc(); toast('تم تحديث طريقة الحساب'); });
  $('#hlRow').onclick = () => pickerSheet('خطوط العرض العليا', [['auto', 'تلقائي', 'موصى به'], ['middleofthenight', 'منتصف الليل'], ['seventhofthenight', 'سُبع الليل'], ['twilightangle', 'زاوية الشفق']], S.highLat, (v) => { S.highLat = v; save(); renderPrefsLoc(); });
  bindSegs(app);
  $$('[data-off]').forEach((b) => b.onclick = () => {
    const k = b.dataset.off; S.offsets[k] = Math.max(-30, Math.min(30, (S.offsets[k] || 0) + Number(b.dataset.d))); save();
    $('#off-' + k).textContent = (S.offsets[k] > 0 ? '+' : '') + S.offsets[k];
  });
  const hj = (d) => { S.hijriAdj = Math.max(-2, Math.min(2, S.hijriAdj + d)); save(); fmtCacheClear(); $('#hjOut').textContent = (S.hijriAdj > 0 ? '+' : '') + S.hijriAdj; };
  $('#hjMinus').onclick = () => hj(-1); $('#hjPlus').onclick = () => hj(1);
}
function renderPrefsAdhan() {
  const notifState = !('Notification' in window) ? 'unsupported' : Notification.permission;
  const soundSub = { adhan1: 'دقيقتان و٣٥ ثانية', adhan2: 'دقيقة و٢٥ ثانية', tone: 'نغمة قصيرة مدمجة', file: S.soundName || 'لم يُختر ملف بعد', silent: 'إشعار فقط' };
  app.innerHTML = `
  ${prefsHead('الأذان والتنبيهات')}
  <main class="view wrap prefs">
    <section class="scard">${FARD.map((k) => `<div class="srow static"><span class="g-ic">${ICONS[k]}</span><span class="r-body"><b>${pName(k)}</b></span>${sw('ad-' + k, S.adhan[k], 'أذان ' + pName(k))}</div>`).join('')}</section>
    <section class="scard">
      <div class="scard-h">${I.headset}<b>صوت الأذان</b></div>
      <div class="sound-list">${SOUNDS.map(([v, l]) => `<div class="sound${S.sound === v ? ' on' : ''}" data-v="${v}">
        <button class="snd-pick" type="button" data-pick="${v}" aria-pressed="${S.sound === v}"><span class="tick-ic">${I.check}</span><span><b>${l}</b><small>${esc(soundSub[v])}</small></span></button>
        ${v !== 'silent' && v !== 'file' ? `<button class="snd-play" type="button" data-play="${v}" aria-label="استماع">${I.play}</button>` : ''}
        ${S.sound === v && v !== 'silent' ? `<div class="wave small" aria-hidden="true">${WAVE.map((h) => `<i style="height:${h}%"></i>`).join('')}</div>` : ''}
      </div>`).join('')}</div>
      <input type="file" id="adhanFile" accept="audio/*" hidden>
      <button class="srow" id="pickFile" type="button">${I.folder}<span class="r-body"><b>اختيار ملف أذان</b><small>${esc(S.soundName || 'MP3 من هاتفك')}</small></span><span class="chev">${I.next}</span></button>
      <button class="srow" id="remRow" type="button">${I.bellOn}<span class="r-body"><b>تذكير قبل الأذان</b><small>${S.reminder ? 'قبل ' + minutesWord(S.reminder) : 'بدون'}</small></span><span class="chev">${I.next}</span></button>
      ${NATIVE ? '' : `<div class="srow static">${I.bellOn}<span class="r-body"><b>إشعارات النظام</b><small>${notifState === 'granted' ? 'مفعّلة' : notifState === 'denied' ? 'محظورة من إعدادات المتصفح' : notifState === 'unsupported' ? 'غير مدعومة في هذا المتصفح' : 'تنبيه عند حلول وقت الصلاة'}</small></span>${notifState === 'default' ? '<button class="btn small" id="notifBtn" type="button">تفعيل</button>' : ''}</div>`}
    </section>
    <section class="scard">
      <div class="scard-h">${BEADS}<b>تذكير الأذكار</b></div>
      <div class="srow static"><span class="g-ic">${ICONS.sunrise}</span><span class="r-body"><b>أذكار الصباح</b><small>بعد الفجر بـ٢٥ دقيقة</small></span>${sw('remAm', S.remindMorning, 'تذكير أذكار الصباح')}</div>
      <div class="srow static"><span class="g-ic">${ICONS.isha}</span><span class="r-body"><b>أذكار المساء</b><small>بعد العصر بـ٢٥ دقيقة</small></span>${sw('remPm', S.remindEvening, 'تذكير أذكار المساء')}</div>
    </section>
    <p class="about" style="text-align:start">${NATIVE ? 'يصلك الأذان في وقته حتى لو كان التطبيق مغلقًا، ويُسمع على مستوى صوت المنبّه. في الوضع الصامت يصل الإشعار دون صوت.' : 'يعمل الأذان ما دام التطبيق مفتوحًا ولو في الخلفية.'}</p>
  </main>`;
  $('#prefsBack').onclick = () => (history.length > 1 ? history.back() : (location.hash = 'prefs'));
  FARD.forEach((k) => { $('#ad-' + k).onchange = (e) => { S.adhan[k] = e.target.checked; save(); }; });
  $('#remAm').onchange = (e) => { S.remindMorning = e.target.checked; save(); };
  $('#remPm').onchange = (e) => { S.remindEvening = e.target.checked; save(); };
  $('.sound-list').onclick = (e) => {
    const pk = e.target.closest('[data-pick]'); const pl = e.target.closest('[data-play]');
    if (pl) {
      const prev = S.sound; S.sound = pl.dataset.play; arm(); playAdhan(); S.sound = prev;
      toast('اضغط مرة أخرى على «إيقاف» من أي مكان لإيقافه', 2000);
      return;
    }
    if (pk) { stopAdhan(); S.sound = pk.dataset.pick; save(); if (S.sound === 'file' && !S.soundName) $('#adhanFile').click(); renderPrefsAdhan(); }
  };
  $('#pickFile').onclick = () => $('#adhanFile').click();
  $('#adhanFile').onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const max = NATIVE ? 8 : 15;
    if (f.size > max * 1024 * 1024) { toast(`الملف كبير جدًا. اختر ملفًا أصغر من ${max} ميغابايت.`); return; }
    if (NATIVE && NATIVE.saveSound) {
      try {
        const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(f); });
        if (!NATIVE.saveSound(b64)) throw new Error('save');
      } catch (err) { toast('تعذر حفظ الملف في التطبيق.'); return; }
    }
    try { await idbPut('adhan', f); S.soundName = f.name; S.sound = 'file'; save(); toast('حُفظ صوت الأذان على جهازك'); renderPrefsAdhan(); }
    catch (err) { toast('تعذر حفظ الملف في هذا المتصفح.'); }
  };
  $('#remRow').onclick = () => pickerSheet('تذكير قبل الأذان', [0, 5, 10, 15, 20, 30].map((m) => [m, m ? 'قبل ' + minutesWord(m) : 'بدون تذكير']), S.reminder, (v) => { S.reminder = Number(v); save(); renderPrefsAdhan(); });
  const nb = $('#notifBtn'); if (nb) nb.onclick = () => Notification.requestPermission().then(() => renderPrefsAdhan());
}
function renderPrefsLook() {
  const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
  app.innerHTML = `
  ${prefsHead('المظهر والتلاوة')}
  <main class="view wrap prefs">
    <section class="scard">
      <div class="scard-h">${I.palette}<b>السمة</b></div>
      <div class="theme-tiles">${[['light', 'فاتح'], ['dark', 'داكن'], ['auto', 'تلقائي']].map(([v, l]) => `<button type="button" data-theme-v="${v}" aria-pressed="${S.theme === v}">${themeArt(v)}<span>${l}</span><span class="radio"></span></button>`).join('')}</div>
    </section>
    <section class="scard">
      <div class="scard-h">${I.clock}<b>تنسيق الوقت</b></div>
      ${segH('h24', S.h24, [['true', '24 ساعة'], ['false', '12 ساعة']])}
    </section>
    <section class="scard">
      <div class="scard-h">${I.headset}<b>القارئ</b></div>
      <button class="srow" id="recRow" type="button"><span class="tick-ic on">${I.check}</span><span class="r-body"><b>${esc(rec[1])}</b><small>التلاوة تحتاج إلى إنترنت</small></span><span class="chev">${I.next}</span></button>
    </section>
    <section class="scard">
      <div class="scard-h">${I.book}<b>إعدادات القراءة</b></div>
      <div class="srow static"><span class="r-body"><b>حجم الخط</b></span><div class="stepper"><button type="button" id="fsPlus" aria-label="تكبير الخط">${I.plus}</button><output id="fsOut">${arNum(S.qsize)}</output><button type="button" id="fsMinus" aria-label="تصغير الخط">${I.minus}</button></div></div>
      <p class="verse-banner font-prev">${SPARK}<span>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</span>${SPARK}</p>
      <div class="srow static"><span class="r-body"><b>التفسير الميسّر تحت كل آية</b><small>يعمل دون إنترنت</small></span>${sw('tfMode', S.tafsirMode, 'عرض التفسير الميسر')}</div>
    </section>
  </main>`;
  $('#prefsBack').onclick = () => (history.length > 1 ? history.back() : (location.hash = 'prefs'));
  $('.theme-tiles').onclick = (e) => {
    const b = e.target.closest('[data-theme-v]'); if (!b) return;
    S.theme = b.dataset.themeV; save(); applyTheme();
    $$('.theme-tiles button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  };
  bindSegs(app);
  $('#recRow').onclick = () => pickerSheet('القارئ', RECITERS.map((r) => [r[0], r[1]]), S.reciter, (v) => { S.reciter = v; save(); renderPrefsLook(); if (P.s) playAyah(P.s, P.a); });
  const upd = (d) => { S.qsize = Math.min(48, Math.max(20, S.qsize + d)); save(); applyTheme(); $('#fsOut').textContent = arNum(S.qsize); };
  $('#fsMinus').onclick = () => upd(-2); $('#fsPlus').onclick = () => upd(2);
  $('#tfMode').onchange = (e) => { S.tafsirMode = e.target.checked; save(); };
}

/* ---------- Adhkar ---------- */
const BEADS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="4.4" r="1.6"/><circle cx="16.8" cy="6.3" r="1.6"/><circle cx="18.8" cy="10.9" r="1.6"/><circle cx="16.6" cy="15.3" r="1.6"/><circle cx="7.2" cy="6.3" r="1.6"/><circle cx="5.2" cy="10.9" r="1.6"/><circle cx="7.4" cy="15.3" r="1.6"/><circle cx="12" cy="17" r="1.6"/><path d="M12 18.6v3M10.4 21.6h3.2"/></svg>';
const ADK_ICONS = {
  morning: ICONS.dhuhr, evening: ICONS.isha, wake: ICONS.sunrise, quran: I.book,
  prayer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V11a8 8 0 0 1 16 0v10"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/><path d="M3 21h18"/><path d="M12 3V1.5"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/></svg>',
};
const ADK_TONE = { morning: 'c2', evening: 'c4', prayer: 'c1', sleep: 'c3', wake: 'c5', quran: 'c6' };
let ADK = null, ADKp = null, hisnIndex = null;
function loadAdhkar() {
  if (!ADKp) {
    ADKp = fetch('adhkar.json').then((r) => { if (!r.ok) throw new Error('adhkar ' + r.status); return r.json(); })
      .then((d) => { ADK = d; return d; }).catch((e) => { ADKp = null; throw e; });
  }
  return ADKp;
}
function adkCat(id) {
  if (!ADK) return null;
  return ADK.featured.find((c) => c.id === id) || ADK.hisn.find((c) => c.id === id) || null;
}
const todayKey = () => key(ymd(new Date(), S.loc.tz));
function adkProgress() {
  const p = LS.get('dhikrDay', null);
  if (!p || p.d !== todayKey()) return { d: todayKey(), p: {} };
  return p;
}
function adkDone(id) {
  const c = adkCat(id); if (!c) return 0;
  const pr = adkProgress().p[id] || {};
  return c.items.filter((it, i) => (pr[i] || 0) >= it.n).length;
}
function repWord(n) {
  if (n === 1) return 'مرة واحدة';
  if (n === 2) return 'مرتان';
  if (n >= 3 && n <= 10) return `${arNum(n)} مرات`;
  return `${arNum(n)} مرة`;
}
function dhikrWord(n) {
  if (n === 1) return 'ذكر واحد';
  if (n === 2) return 'ذكران';
  if (n >= 3 && n <= 10) return `${arNum(n)} أذكار`;
  return `${arNum(n)} ذكرًا`;
}
function contextualAdhkar(st, now) {
  const T = st.today;
  if (now >= T.fajr && now < T.asr) return 'morning';
  if (now >= T.asr && now < T.isha) return 'evening';
  return 'sleep';
}

function renderAdhkar() {
  app.innerHTML = `
  ${brand()}
  ${pageTitle('الأذكار والأدعية')}
  <main class="view wrap">
    <p class="verse-banner">${SPARK}<span id="adkVerse">أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ</span>${SPARK}</p>
    <section class="adk-grid" id="adkGrid"><div class="empty">جارٍ التحميل…</div></section>
    <button class="tasbih-tile" id="tasbihTile" type="button">${patternSvg()}<span class="tt-ill">${beadsSvg()}</span><span class="tt-text"><b>السبحة الإلكترونية</b><span id="tasbihSub">عدّاد للتسبيح مع اهتزاز عند كل تسبيحة</span></span><span class="c-go">${I.next}</span></button>
    <h2 class="sec-title">حصن المسلم</h2>
    <div class="search-box">${I.search}<input class="input" id="hsearch" type="search" placeholder="ابحث عن دعاء: السفر، المطر، الكرب…" autocomplete="off" aria-label="البحث في حصن المسلم"></div>
    <ul class="list hisn" id="hlist"></ul>
  </main>`;
  const tz = LS.get('tasbih', null);
  if (tz && tz.d === todayKey() && tz.total) $('#tasbihSub').textContent = `سبّحت اليوم ${arNum(tz.total)} مرة`;
  $('#tasbihTile').onclick = () => { location.hash = 'tasbih'; };
  loadQuran().then(() => { const el = $('#adkVerse'); if (el) el.textContent = Q[12][2][27].split(' ').slice(-5).join(' ').replace(/\s*۝.*$/, ''); }).catch(() => {});
  loadAdhkar().then(() => {
    $('#adkGrid').innerHTML = ADK.featured.map((c) => {
      const done = adkDone(c.id), total = c.items.length;
      const pct = Math.round((done / total) * 100);
      return `<button class="adk-card${done === total ? ' complete' : ''}" type="button" data-c="${c.id}">
        <span class="adk-ill">${ILL[c.id] || ''}</span>
        <b>${esc(c.title)}</b>
        <span class="adk-meta">${done === total ? 'أتممتها اليوم' : done ? `${arNum(done)} من ${arNum(total)}` : dhikrWord(total)}</span>
        <span class="adk-bar" aria-hidden="true"><i style="width:${Math.max(pct, 4)}%"></i></span>
      </button>`;
    }).join('');
    $('#adkGrid').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) location.hash = 'dhikr-' + b.dataset.c; };
    const draw = (q) => {
      let list = ADK.hisn;
      const n = norm(q || '');
      if (n.length >= 2) {
        if (!hisnIndex) hisnIndex = ADK.hisn.map((c) => norm(c.title + ' ' + c.items.map((it) => it.t).join(' ')));
        list = ADK.hisn.filter((c, i) => hisnIndex[i].includes(n));
      }
      $('#hlist').innerHTML = list.length
        ? list.map((c) => `<li><button type="button" data-c="${c.id}">${hisnIcon(c.title)}<span class="s-title">${esc(c.title)}</span><span class="chev">${I.next}</span></button></li>`).join('')
        : '<li><div class="empty">لا يوجد دعاء بهذه الكلمة.</div></li>';
    };
    draw('');
    let tm; $('#hsearch').addEventListener('input', (e) => { clearTimeout(tm); tm = setTimeout(() => draw(e.target.value), 200); });
    $('#hlist').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) location.hash = 'dhikr-' + b.dataset.c; };
  }).catch(() => { $('#adkGrid').innerHTML = '<div class="empty">تعذر تحميل الأذكار. أعد فتح الصفحة.</div>'; });
}

/* Dhikr reader: the current dhikr is large with its counter; finishing it moves on by itself. */
const dk = { el: null, id: null, focus: 0 };
const CORNER = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 37V12a9 9 0 0 1 9-9h25"/><path d="M9 37V17a8 8 0 0 1 8-8h20"/><path d="M15 15c3-3 7-2 7 2s-5 4-6 1"/></g></svg>';
const corners = () => `<span class="corners" aria-hidden="true"><i class="tl">${CORNER}</i><i class="tr">${CORNER}</i></span>`;
function showDhikr(id) {
  if (!ADK) { loadAdhkar().then(() => showDhikr(id)).catch(() => toast('تعذر تحميل الأذكار.')); return; }
  const c = adkCat(id); if (!c) { location.hash = 'adhkar'; return; }
  if (!dk.el) { dk.el = document.createElement('div'); dk.el.className = 'reader dhikr'; document.body.appendChild(dk.el); }
  document.body.classList.add('reading');
  document.body.style.overflow = 'hidden';
  const firstOpen = () => { const pr = adkProgress().p[id] || {}; const i = c.items.findIndex((it, k) => (pr[k] || 0) < it.n); return i < 0 ? 0 : i; };
  if (dk.id !== id) { dk.id = id; dk.focus = firstOpen(); }
  const left = (i) => Math.max(0, c.items[i].n - ((adkProgress().p[id] || {})[i] || 0));
  dk.el.innerHTML = readerTop('dkBack', esc(c.title), '', `<button class="icon-btn" id="dkReset" type="button" aria-label="إعادة العدّ من البداية">${I.refresh}</button>`, '<div class="dk-progress" aria-hidden="true"><i id="dkBar"></i></div>')
    + `<div class="reader-scroll" id="dkScroll"><div class="wrap dk-list" id="dkList"></div></div>
    <div class="dk-dock"><div class="inner">
      <button class="btn primary" id="dkNext" type="button">الذكر التالي ${I.next}</button>
      <div class="dk-hint"><span>اضغط على العدّاد أو على النص مع كل ذكر</span><span class="dk-mini-bar"><i id="dkBar2"></i></span><small id="dkCount"></small></div>
    </div></div>`;
  const draw = () => {
    $('#dkList', dk.el).innerHTML = c.items.map((it, i) => {
      const l = left(i), done = l === 0, on = i === dk.focus;
      if (on) {
        return `<article class="dk on${done ? ' done' : ''}" data-i="${i}">${corners()}
          <p class="dk-t${it.q ? ' q' : ''}">${esc(it.t)}</p>
          <p class="dk-rep">${repWord(it.n)}</p>
          <button class="dk-count" type="button" aria-label="سبّح: المتبقي ${l}">${done ? I.check : `<b>${arNum(l)}</b>`}<small>${done ? 'تمّ' : 'المتبقي'}</small></button>
          <div class="dk-tools">
            ${it.r ? `<button class="dk-mini" type="button" data-act="src" aria-expanded="false">${I.info} ${it.q ? 'الموضع' : 'المصدر'}</button>` : '<span></span>'}
            <button class="dk-mini" type="button" data-act="copy" aria-label="نسخ">${I.copy}</button>
          </div>
          ${it.r ? `<p class="dk-ref" hidden>${esc(it.r)}</p>` : ''}
        </article>`;
      }
      return `<article class="dk${done ? ' done' : ''}" data-i="${i}">
        <p class="dk-t${it.q ? ' q' : ''}">${esc(it.t)}</p>
        <span class="dk-chip">${done ? I.check : ''}<b>${arNum(done ? it.n : l)}</b></span>
      </article>`;
    }).join('') + `<p class="about">${esc(c.src === 'القرآن الكريم' ? 'من نص المصحف الشريف في التطبيق.' : 'من كتاب حصن المسلم للشيخ سعيد بن علي بن وهف القحطاني.')}</p>`;
    const done = adkDone(id), total = c.items.length;
    $('#dkBackSub', dk.el).textContent = done === total ? 'أتممتها، تقبّل الله منك' : `${arNum(done)} من ${arNum(total)}`;
    const pct = (done / total * 100).toFixed(1) + '%';
    $('#dkBar', dk.el).style.width = pct; $('#dkBar2', dk.el).style.width = pct;
    $('#dkCount', dk.el).textContent = `${arNum(done)} من ${arNum(total)}`;
    $('#dkNext', dk.el).disabled = dk.focus >= total - 1 && left(dk.focus) === 0;
  };
  const focusOn = (i, smooth) => {
    dk.focus = i; draw();
    const el = $(`.dk[data-i="${i}"]`, dk.el);
    if (el) el.scrollIntoView({ block: 'start', behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  };
  const nextOpen = (from) => {
    const pr = adkProgress().p[id] || {};
    for (let k = from + 1; k < c.items.length; k++) if ((pr[k] || 0) < c.items[k].n) return k;
    return from + 1 < c.items.length ? from + 1 : -1;
  };
  const count = (i) => {
    const it = c.items[i];
    const all = adkProgress(); const p = all.p[id] || (all.p[id] = {});
    if ((p[i] || 0) >= it.n) return;
    p[i] = (p[i] || 0) + 1; LS.set('dhikrDay', all);
    const l = it.n - p[i];
    const btn = $(`.dk[data-i="${i}"] .dk-count`, dk.el);
    if (l > 0) {
      if (btn) { btn.innerHTML = `<b>${arNum(l)}</b><small>المتبقي</small>`; btn.classList.remove('tick'); void btn.offsetWidth; btn.classList.add('tick'); }
      if (navigator.vibrate) navigator.vibrate(12);
      return;
    }
    if (navigator.vibrate) navigator.vibrate(40);
    if (adkDone(id) === c.items.length) { draw(); toast('أتممت ' + c.title + '، تقبّل الله منك', 3200); return; }
    if (btn) { btn.innerHTML = `${I.check}<small>تمّ</small>`; btn.classList.add('tick'); }
    // Move on without stopping.
    const n = nextOpen(i);
    setTimeout(() => { if (dk.id === id && n >= 0) focusOn(n, true); }, 260);
  };
  draw();
  requestAnimationFrame(() => { const el = $(`.dk[data-i="${dk.focus}"]`, dk.el); if (el && dk.focus > 0) el.scrollIntoView({ block: 'start' }); });
  $('#dkBack', dk.el).onclick = () => (history.length > 1 ? history.back() : (location.hash = 'adhkar'));
  $('#dkReset', dk.el).onclick = () => {
    const all = adkProgress(); delete all.p[id]; LS.set('dhikrDay', all);
    focusOn(0, false); toast('بدأ العدّ من جديد');
  };
  $('#dkNext', dk.el).onclick = () => { const n = nextOpen(dk.focus); if (n >= 0) focusOn(n, true); };
  $('#dkList', dk.el).onclick = (e) => {
    const card = e.target.closest('.dk'); if (!card) return;
    const i = Number(card.dataset.i); const it = c.items[i];
    const act = e.target.closest('[data-act]');
    if (act && act.dataset.act === 'src') { const ref = $('.dk-ref', card); ref.hidden = !ref.hidden; act.setAttribute('aria-expanded', String(!ref.hidden)); return; }
    if (act && act.dataset.act === 'copy') {
      const t = it.t + (it.r && it.q ? `\n﴿${it.r}﴾` : '');
      const done = () => toast('نُسخ النص');
      try { navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done)); } catch (err) { fallbackCopy(t, done); }
      return;
    }
    if (window.getSelection && String(window.getSelection()).length > 0) return;
    if (i !== dk.focus) { focusOn(i, true); return; }
    count(i);
  };
}
function hideDhikr() {
  if (!dk.el) return;
  dk.el.remove(); dk.el = null; dk.id = null;
  if (!reader.open && !ts.el) { document.body.classList.remove('reading'); document.body.style.overflow = ''; }
}

/* Tasbih counter */
const TASBIH_PHRASES = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'اللَّهُ أَكْبَرُ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'أَسْتَغْفِرُ اللَّهَ', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ'];
const TASBIH_SHORT = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'سبحان الله وبحمده', 'لا حول ولا قوة إلا بالله', 'الصلاة على النبي ﷺ'];
const ts = { el: null };
function tasbihState() {
  const s = LS.get('tasbih', null) || {};
  const d = todayKey();
  return { p: s.p || 0, target: s.target === undefined ? 33 : s.target, count: s.count || 0, total: s.d === d ? (s.total || 0) : 0, d, vib: s.vib !== false };
}
function showTasbih() {
  if (!ts.el) { ts.el = document.createElement('div'); ts.el.className = 'reader tasbih'; document.body.appendChild(ts.el); }
  document.body.classList.add('reading'); document.body.style.overflow = 'hidden';
  const st = tasbihState();
  const R = 116, C = 2 * Math.PI * R;
  ts.el.innerHTML = readerTop('tsBack', 'السبحة', '', `<button class="pill-btn" id="tsReset" type="button">${I.refresh} إعادة الضبط</button>`)
    + `<div class="reader-scroll"><div class="wrap ts-body">
      <span class="ts-total" id="tsTotal"></span>
      <div class="ts-beads">${beadsSvg()}</div>
      <p class="ts-phrase" id="tsPhrase">${TASBIH_PHRASES[st.p]}</p>
      <button class="ts-ring" id="tsTap" type="button" aria-label="سبّح">
        <svg viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="${R}" class="ts-track"/><circle cx="130" cy="130" r="${R}" class="ts-fill" id="tsFill" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 130 130)"/><circle id="tsDot" r="8" cx="130" cy="${130 - R}" class="ts-dot"/></svg>
        <span class="ts-num" id="tsNum">0</span>
        <span class="ts-of" id="tsOf"></span>
      </button>
      <p class="ts-hint">اضغط للتسبيح</p>
      <div class="ts-target" role="group" aria-label="العدد">${[[33, '٣٣'], [99, '٩٩'], [100, '١٠٠'], [0, 'بلا حد']].map(([v, l]) => `<button type="button" data-t="${v}" aria-pressed="${st.target === v}">${l}</button>`).join('')}</div>
      <div class="ts-phrases" role="group" aria-label="الذكر">${TASBIH_SHORT.map((t, i) => `<button type="button" data-p="${i}" aria-pressed="${st.p === i}">${t}</button>`).join('')}</div>
      <div class="group ts-vib"><div class="row plain">${I.vibrate}<div class="r-body"><b>الاهتزاز</b><small>اهتزاز خفيف مع كل تسبيحة وأقوى عند تمام العدد</small></div><label class="switch"><input type="checkbox" id="tsVib" ${st.vib ? 'checked' : ''} aria-label="الاهتزاز"><span></span></label></div></div>
    </div></div>`;
  const put = (patch) => LS.set('tasbih', Object.assign(tasbihState(), patch));
  const draw = (bump) => {
    const s = tasbihState();
    $('#tsNum').textContent = arNum(s.count);
    $('#tsOf').textContent = s.target ? `من ${arNum(s.target)}` : 'بلا حد';
    const frac = s.target ? Math.min(1, s.count / s.target) : (s.count % 33) / 33;
    $('#tsFill').setAttribute('stroke-dashoffset', String(C * (1 - frac)));
    const ang = frac * 2 * Math.PI - Math.PI / 2;
    $('#tsDot').setAttribute('cx', (130 + R * Math.cos(ang)).toFixed(1)); $('#tsDot').setAttribute('cy', (130 + R * Math.sin(ang)).toFixed(1));
    $('#tsTotal').textContent = `مجموع اليوم ${arNum(s.total)}`;
    if (bump) { const n = $('#tsNum'); n.classList.remove('tick'); void n.offsetWidth; n.classList.add('tick'); }
  };
  draw(false);
  $('#tsTap').addEventListener('click', () => {
    const s = tasbihState();
    let count = s.count + 1;
    if (s.target && count > s.target) count = 1;
    put({ count, total: s.total + 1 });
    if (s.vib && navigator.vibrate) navigator.vibrate(s.target && count === s.target ? [60, 60, 120] : 10);
    draw(true);
  });
  $('.ts-phrases', ts.el).onclick = (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return;
    put({ p: Number(b.dataset.p), count: 0 });
    $$('.ts-phrases button', ts.el).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#tsPhrase').textContent = TASBIH_PHRASES[Number(b.dataset.p)];
    draw(false);
  };
  $('.ts-target', ts.el).onclick = (e) => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    put({ target: Number(b.dataset.t), count: 0 });
    $$('.ts-target button', ts.el).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw(false);
  };
  $('#tsVib').onchange = (e) => put({ vib: e.target.checked });
  $('#tsReset').onclick = () => { put({ count: 0 }); draw(false); toast('صُفّر العدّاد'); };
  $('#tsBack').onclick = () => (history.length > 1 ? history.back() : (location.hash = 'adhkar'));
}
function hideTasbih() {
  if (!ts.el) return;
  ts.el.remove(); ts.el = null;
  if (!reader.open && !dk.el) { document.body.classList.remove('reading'); document.body.style.overflow = ''; }
}

/* ---------- Tafsir al-Muyassar (offline) ---------- */
let TF = null, TFp = null;
function loadTafsir() {
  if (!TFp) {
    TFp = fetch('tafsir.json').then((r) => { if (!r.ok) throw new Error('tafsir ' + r.status); return r.json(); })
      .then((d) => { TF = d; return d; }).catch((e) => { TFp = null; throw e; });
  }
  return TFp;
}
function tafsirHtml(text) {
  return text.split('\n').map((line) => {
    const t = line.trim();
    if (!t) return '';
    if (/^(تسمية السورة|من مقاصد السورة|\[التفسير\])$/.test(t)) return `<b class="tf-h">${esc(t.replace(/[[\]]/g, ''))}</b>`;
    return `<span class="tf-l">${esc(t).replace(/﴿([^﴾]+)﴾/g, '<span class="tf-q">﴿$1﴾</span>')}</span>`;
  }).filter(Boolean).join('');
}

/* ---------- Zakat calculator ---------- */
const CURRENCIES = [['DZD', 'د.ج'], ['MAD', 'د.م'], ['TND', 'د.ت'], ['LYD', 'د.ل'], ['EGP', 'ج.م'], ['SAR', 'ر.س'], ['AED', 'د.إ'], ['QAR', 'ر.ق'], ['KWD', 'د.ك'], ['EUR', '€'], ['USD', '$'], ['GBP', '£'], ['CAD', '$ كندي'], ['TRY', '₺']];
const COUNTRY_CUR = { 'الجزائر': 'DZD', 'المغرب': 'MAD', 'تونس': 'TND', 'ليبيا': 'LYD', 'مصر': 'EGP', 'السعودية': 'SAR', 'الإمارات': 'AED', 'قطر': 'QAR', 'الكويت': 'KWD', 'فرنسا': 'EUR', 'بلجيكا': 'EUR', 'ألمانيا': 'EUR', 'إسبانيا': 'EUR', 'إيطاليا': 'EUR', 'بريطانيا': 'GBP', 'كندا': 'CAD', 'الولايات المتحدة': 'USD', 'تركيا': 'TRY' };
const zk = { el: null };
function showZakat() {
  if (!zk.el) { zk.el = document.createElement('div'); zk.el.className = 'reader zakat'; document.body.appendChild(zk.el); }
  document.body.classList.add('reading'); document.body.style.overflow = 'hidden';
  const z = Object.assign({ cur: COUNTRY_CUR[S.loc.country] || 'DZD', basis: 'gold', goldPrice: '', silverPrice: '', cash: '', gold: '', karat: '21', silver: '', trade: '', owed: '', debts: '' }, LS.get('zakat', {}));
  const field = (id, label, hint, unit) => `<label class="zf" for="z-${id}"><span class="zf-l">${label}${hint ? `<small>${hint}</small>` : ''}</span><span class="zf-in"><input class="input" id="z-${id}" inputmode="decimal" dir="ltr" value="${esc(z[id])}" placeholder="0" autocomplete="off"><em data-unit="${unit}">${unit === 'cur' ? '' : unit}</em></span></label>`;
  zk.el.innerHTML = readerTop('zkBack', 'حاسبة الزكاة', 'المال والذهب والفضة وعروض التجارة') + `
    <div class="reader-scroll"><div class="wrap zk-body">
      <section class="group zk-sec">
        <h3>النصاب</h3>
        <div class="row plain"><div class="r-body"><b>العملة</b></div><select class="input" id="z-cur" aria-label="العملة">${CURRENCIES.map(([c, l]) => `<option value="${c}" ${z.cur === c ? 'selected' : ''}>${l} (${c})</option>`).join('')}</select></div>
        <div class="row plain"><div class="r-full"><div class="seg" role="group" id="z-basis"><button type="button" data-v="gold" aria-pressed="${z.basis === 'gold'}">بالذهب: ٨٥ غرامًا</button><button type="button" data-v="silver" aria-pressed="${z.basis === 'silver'}">بالفضة: ٥٩٥ غرامًا</button></div></div></div>
        ${field('goldPrice', 'سعر غرام الذهب عيار ٢٤', 'من الصائغ أو البنك، سعر اليوم', 'cur')}
        ${field('silverPrice', 'سعر غرام الفضة', 'مطلوب إن اخترت نصاب الفضة أو كان عندك فضة', 'cur')}
      </section>
      <section class="group zk-sec">
        <h3>أموالك التي حال عليها الحول</h3>
        ${field('cash', 'النقود', 'في البيت والحساب البنكي والبريدي', 'cur')}
        <div class="zf-pair">${field('gold', 'الذهب', 'الذهب المدّخر، وفي الحلي الملبوس خلاف بين العلماء', 'غ')}
          <label class="zf zf-k" for="z-karat"><span class="zf-l">العيار</span><select class="input" id="z-karat">${['24', '22', '21', '18'].map((k) => `<option value="${k}" ${z.karat === k ? 'selected' : ''}>${arNum(k)}</option>`).join('')}</select></label></div>
        ${field('silver', 'الفضة', '', 'غ')}
        ${field('trade', 'عروض التجارة', 'قيمة البضائع المعدّة للبيع بسعر اليوم', 'cur')}
        ${field('owed', 'ديون لك عند الآخرين', 'المرجوّ سدادها', 'cur')}
        ${field('debts', 'ديون عليك', 'الحالّة الآن، تُخصم من المجموع', 'cur')}
      </section>
      <section class="zk-result" id="zkResult" aria-live="polite"></section>
      <p class="note">تجب الزكاة إذا بلغ المال النصاب وحال عليه حول هجري كامل، ومقدارها ربع العشر (٢٫٥٪). أسعار الذهب والفضة تتغير كل يوم، فأدخل سعر يومك. في الحالات الخاصة (الشركات، الأسهم، الحلي المستعمل) استشر أهل العلم.</p>
    </div></div>`;
  const num = (id) => { const v = parseFloat(String($('#z-' + id, zk.el).value).replace(/[,\s]/g, '').replace('٫', '.').replace(/[٠-٩]/g, (d) => AR.indexOf(d))); return isFinite(v) && v > 0 ? v : 0; };
  const curLabel = () => (CURRENCIES.find((c) => c[0] === z.cur) || ['', ''])[1];
  const money = (v) => new Intl.NumberFormat('ar-u-nu-latn', { maximumFractionDigits: 2, minimumFractionDigits: v % 1 ? 2 : 0 }).format(v) + ' ' + curLabel();
  const calc = () => {
    for (const k of ['goldPrice', 'silverPrice', 'cash', 'gold', 'silver', 'trade', 'owed', 'debts']) z[k] = $('#z-' + k, zk.el).value;
    z.karat = $('#z-karat', zk.el).value; z.cur = $('#z-cur', zk.el).value;
    LS.set('zakat', z);
    $$('em[data-unit="cur"]', zk.el).forEach((e) => { e.textContent = curLabel(); });
    const gp = num('goldPrice'), sp = num('silverPrice');
    const goldVal = num('gold') * (Number(z.karat) / 24) * gp;
    const silverVal = num('silver') * sp;
    const total = num('cash') + goldVal + silverVal + num('trade') + num('owed') - num('debts');
    const nisab = z.basis === 'gold' ? 85 * gp : 595 * sp;
    const box = $('#zkResult', zk.el);
    if (!nisab) {
      box.innerHTML = `<div class="zk-wait">${I.coins}<p>أدخل سعر غرام ${z.basis === 'gold' ? 'الذهب' : 'الفضة'} لحساب النصاب.</p></div>`;
      return;
    }
    const reached = total >= nisab;
    box.innerHTML = `<div class="zk-card">${patternSvg()}
      <div class="zk-row"><span>مجموع أموالك</span><b>${money(Math.max(0, total))}</b></div>
      <div class="zk-row"><span>النصاب (${z.basis === 'gold' ? '٨٥ غ ذهب' : '٥٩٥ غ فضة'})</span><b>${money(nisab)}</b></div>
      <span class="zk-chip ${reached ? 'ok' : ''}">${reached ? 'بلغ مالك النصاب' : 'لم يبلغ مالك النصاب، فلا زكاة عليه'}</span>
      ${reached ? `<div class="zk-due"><small>الزكاة الواجبة (ربع العشر)</small><output>${money(total * 0.025)}</output></div>` : ''}
    </div>`;
  };
  zk.el.addEventListener('input', calc);
  zk.el.addEventListener('change', calc);
  $('#z-basis', zk.el).onclick = (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    z.basis = b.dataset.v; $$('#z-basis button', zk.el).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); calc();
  };
  $('#zkBack', zk.el).onclick = () => (history.length > 1 ? history.back() : (location.hash = 'home'));
  calc();
}
function hideZakat() {
  if (!zk.el) return;
  zk.el.remove(); zk.el = null;
  if (!reader.open && !dk.el && !ts.el) { document.body.classList.remove('reading'); document.body.style.overflow = ''; }
}

/* ---------- Android home-screen widget ---------- */
function pushWidgetData() {
  if (!NATIVE || !NATIVE.setWidget) return;
  try {
    const days = [];
    let d = ymd(new Date(), S.loc.tz);
    for (let i = 0; i < 31; i++, d = addDays(d, 1)) {
      const tt = dayTimes(d); const fri = isFriday(d);
      days.push({ d: key(d), h: fmt('hijriShort', tt.dhuhr), times: PRAYERS.map((p) => ({ k: p.key, n: pName(p.key, fri), t: tt[p.key].getTime(), s: fmtTime(tt[p.key]) })) });
    }
    NATIVE.setWidget(JSON.stringify({ place: S.loc.name, tz: S.loc.tz, days }));
  } catch (e) { /* bridge unavailable */ }
}

/* ---------- router ---------- */
const VIEWS = { home: renderHome, quran: renderQuran, adhkar: renderAdhkar, qibla: renderQibla, prefs: renderPrefs, month: renderMonth, 'prefs-loc': renderPrefsLoc, 'prefs-adhan': renderPrefsAdhan, 'prefs-look': renderPrefsLook };
const tabOf = (r) => (r.startsWith('prefs') ? 'prefs' : r === 'month' ? 'home' : r);
function route(force) {
  let r = location.hash.replace('#', '') || 'home';
  const isRead = r === 'read';
  const dhikrId = r.startsWith('dhikr-') ? r.slice(6) : null;
  const isTasbih = r === 'tasbih';
  const isZakat = r === 'zakat';
  if (isRead) r = 'quran';
  if (dhikrId || isTasbih) r = 'adhkar';
  if (isZakat) r = current && VIEWS[current] ? current : 'home';
  if (!VIEWS[r]) r = 'home';
  if (current !== r || force === true) {
    closeSheet();
    if (compassCleanup) { compassCleanup(); compassCleanup = null; }
    current = r; setTab(tabOf(r));
    VIEWS[r]();
    window.scrollTo(0, 0);
  }
  if (isRead) showReader(); else { hideReader(); }
  if (dhikrId) showDhikr(dhikrId); else hideDhikr();
  if (isTasbih) showTasbih(); else hideTasbih();
  if (isZakat) showZakat(); else hideZakat();
  if (!dhikrId && !isTasbih && !isZakat && current === 'adhkar' && force !== true) {
    // Returning from a reader: refresh today's progress on the cards.
    const g = $('#adkGrid'); if (g && ADK) renderAdhkar();
  }
}
window.__mihrabOpen = (id) => { if (/^[a-z0-9]+$/.test(id)) location.hash = 'dhikr-' + id; };
window.addEventListener('hashchange', () => route());

function tick() {
  const now = new Date();
  let st;
  try { st = state(now); } catch (e) { return; }
  if (current === 'home' && !reader.open) updateHero(st);
  checkAdhan(st, now);
}

/* ---------- boot ---------- */
applyTheme();
route();
tickTimer = setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); pushNativeSchedule(); } });
pushNativeSchedule();
loadQuran().catch(() => {});

// Refresh GPS position silently when the permission was already granted.
if (S.loc.gps || S.loc.auto) {
  try {
    if (navigator.permissions && navigator.geolocation) navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') locate(true); }).catch(() => {});
  } catch (e) { /* ignore */ }
}

if (!NATIVE && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
})();
