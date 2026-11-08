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
const KAABA = { lat: 21.422487, lng: 39.826206 };

/* ---------- settings ---------- */
const deviceTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } })();
const DEFAULTS = {
  loc: null, method: 'algeria', methodManual: false, madhab: 'shafi', highLat: 'auto',
  offsets: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  hijriAdj: 0, h24: true,
  adhan: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reminder: 0, sound: 'tone', soundName: '', reciter: 'ar.alafasy', qsize: 28, theme: 'auto',
};
const S = Object.assign({}, DEFAULTS, LS.get('settings', {}));
S.offsets = Object.assign({}, DEFAULTS.offsets, S.offsets || {});
S.adhan = Object.assign({}, DEFAULTS.adhan, S.adhan || {});
if (!S.loc) {
  const byTz = CITIES.find((c) => c[4] === deviceTz) || CITIES[0];
  S.loc = { lat: byTz[2], lng: byTz[3], name: byTz[0], country: byTz[1], tz: byTz[4], auto: true };
  S.method = byTz[5];
}
if (!METHODS[S.method]) S.method = 'mwl';
const save = () => { LS.set('settings', S); invalidate(); };

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

function applyTheme() {
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
function stopAdhan() { if (adhanStop) { adhanStop(); adhanStop = null; } }

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
  ov.innerHTML = `<div>
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
      playAdhan();
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

/* ---------- recitation player ---------- */
const P = { audio: null, s: 0, a: 0, playing: false, tries: [] };
function audioFor(s, a) {
  const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
  const brs = [rec[2], 128, 64, 192, 48, 32].filter((v, i, arr) => arr.indexOf(v) === i);
  return brs.map((br) => `https://cdn.islamic.network/quran/audio/${br}/${rec[0]}/${OFF[s - 1] + a}.mp3`);
}
function playAyah(s, a) {
  if (!P.audio) {
    P.audio = new Audio();
    P.audio.preload = 'auto';
    P.audio.addEventListener('ended', () => nextAyah());
    P.audio.addEventListener('error', () => {
      if (!P.playing) return;
      const nxt = P.tries.shift();
      if (nxt) { P.audio.src = nxt; P.audio.play().catch(() => {}); }
      else { P.playing = false; renderPlayer(); toast('تعذر تحميل التلاوة. تحقق من الاتصال بالإنترنت.'); }
    });
  }
  stopAdhan();
  P.s = s; P.a = a; P.playing = true;
  P.tries = audioFor(s, a);
  P.audio.src = P.tries.shift();
  P.audio.play().catch(() => {});
  markPlaying(); renderPlayer(); mediaSession();
}
function nextAyah() {
  if (!Q) return;
  let { s, a } = P;
  if (a < Q[s - 1][2].length) a++;
  else if (s < 114) { s++; a = 1; }
  else { stopPlayer(); return; }
  if (reader.open && reader.s !== s) { openSurah(s, a, { keepPlayer: true }); }
  playAyah(s, a);
}
function togglePlay() {
  if (!P.audio) return;
  if (P.playing) { P.audio.pause(); P.playing = false; } else { P.audio.play().catch(() => {}); P.playing = true; }
  renderPlayer();
}
function stopPlayer() {
  if (P.audio) { P.audio.pause(); P.audio.removeAttribute('src'); P.audio.load(); }
  P.playing = false; P.s = 0;
  markPlaying(); renderPlayer();
}
function markPlaying() {
  $$('.ayah.playing').forEach((e) => e.classList.remove('playing'));
  if (!P.s || !reader.open || reader.s !== P.s) return;
  const el = $(`.ayah[data-a="${P.a}"]`);
  if (el) { el.classList.add('playing'); el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
}
function renderPlayer() {
  let bar = $('.player');
  if (!P.s) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.className = 'player'; document.body.appendChild(bar); }
  const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
  bar.innerHTML = `<div class="inner wrap">
    <button class="round" id="pToggle" type="button" aria-label="${P.playing ? 'إيقاف مؤقت' : 'تشغيل'}">${P.playing ? I.pause : I.play}</button>
    <div class="info"><b>سورة ${esc(surahName(P.s))} — الآية ${arNum(P.a)}</b><span>${esc(rec[1])}</span></div>
    <button class="icon-btn" id="pStop" type="button" aria-label="إغلاق المشغل">${I.close}</button>
  </div>`;
  $('#pToggle', bar).onclick = togglePlay;
  $('#pStop', bar).onclick = stopPlayer;
}
function mediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    const rec = RECITERS.find((r) => r[0] === S.reciter) || RECITERS[0];
    navigator.mediaSession.metadata = new MediaMetadata({ title: `سورة ${surahName(P.s)} — ${arNum(P.a)}`, artist: rec[1], album: 'القرآن الكريم', artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('nexttrack', nextAyah);
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

/* ---------- Home ---------- */
function renderHome() {
  const st = state();
  const showArm = FARD.some((k) => S.adhan[k]) && !audioArmed && !(navigator.userActivation && navigator.userActivation.hasBeenActive);
  app.innerHTML = `
  <header class="topbar wrap">
    <h1>مواقيت الصلاة</h1>
    <button class="icon-btn" id="monthBtn" type="button" aria-label="جدول الشهر" title="جدول الشهر">${I.cal}</button>
  </header>
  <main class="view wrap">
    <section class="hero" aria-live="polite">
      <div class="hero-top">
        <button class="place" id="placeBtn" type="button">${I.pin}<span>${esc(S.loc.name)}</span></button>
        <div class="dates"><b id="hijri">${esc(fmt('hijri', new Date()))}</b><span id="greg">${esc(fmt('greg', new Date()))}</span></div>
      </div>
      <div class="label" id="nextLabel"></div>
      <div class="next-name" id="nextName"></div>
      <div class="next-row"><div class="countdown" id="countdown">--:--:--</div><div class="at" id="nextAt"></div></div>
      <div class="progress" aria-hidden="true"><i id="prog"></i></div>
    </section>
    ${S.loc.auto ? `<div class="banner">${I.pin}<span>المواقيت محسوبة لمدينة ${esc(S.loc.name)}. حدّد موقعك لدقة أكبر.</span><button class="btn small primary" id="locateBtn" type="button">موقعي</button></div>` : ''}
    ${showArm ? `<div class="banner" id="armBanner">${I.bellOn}<span>اضغط في أي مكان لتفعيل صوت الأذان، وأبقِ التطبيق مفتوحًا.</span></div>` : ''}
    <section class="card"><ul class="times" id="times"></ul></section>
    <div class="row-actions">
      <button class="tile" id="contRead" type="button">${I.book}<div><b>${lastRead ? 'متابعة القراءة' : 'المصحف الشريف'}</b><span id="contReadSub">${lastRead ? '…' : 'ابدأ من سورة الفاتحة'}</span></div></button>
      <button class="tile" id="qiblaTile" type="button">${I.compass}<div><b>اتجاه القبلة</b><span>${Math.round(qiblaBearing())}° من الشمال</span></div></button>
    </div>
  </main>`;
  renderTimes(st);
  $('#monthBtn').onclick = () => openMonth();
  $('#placeBtn').onclick = () => { location.hash = 'prefs'; };
  $('#qiblaTile').onclick = () => { location.hash = 'qibla'; };
  $('#contRead').onclick = () => { loadQuran().then(() => openSurah(lastRead ? lastRead.s : 1, lastRead ? lastRead.a : 1)).catch(quranErr); };
  if (lastRead) loadQuran().then(() => { const el = $('#contReadSub'); if (el) el.textContent = `سورة ${surahName(lastRead.s)} · الآية ${arNum(lastRead.a)}`; }).catch(() => {});
  const lb = $('#locateBtn'); if (lb) lb.onclick = () => locate();
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
    const sub = p.key === 'dhuhr' && st.friday ? '<small>صلاة الجمعة</small>' : (p.key === 'sunrise' ? '<small>نهاية وقت الفجر</small>' : '');
    return `<li class="${isNext ? 'is-next' : ''} ${past ? 'is-past' : ''}">
      <span class="t-ico">${ICONS[p.key]}</span>
      <span class="t-name">${esc(pName(p.key, st.friday))}${sub}</span>
      <span class="t-time">${esc(fmtTime(t))}</span>
      <button class="bell" type="button" data-k="${p.key}" ${p.noAdhan ? 'disabled aria-label="لا أذان للشروق"' : `aria-pressed="${on}" aria-label="أذان ${esc(p.name)}: ${on ? 'مفعل' : 'متوقف'}"`}>${on ? I.bellOn : I.bellOff}</button>
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
  const left = st.next.time - now;
  $('#nextLabel').textContent = st.next.tomorrow ? 'الصلاة القادمة (غدًا)' : 'الصلاة القادمة';
  nn.textContent = pName(st.next.key, st.next.tomorrow ? isFriday(addDays(st.t, 1)) : st.friday);
  $('#countdown').textContent = fmtLeft(left);
  $('#nextAt').textContent = `الأذان ${fmtTime(st.next.time)}`;
  const span = st.next.time - st.prev.time;
  const pct = Math.min(100, Math.max(0, ((now - st.prev.time) / span) * 100));
  $('#prog').style.width = pct.toFixed(1) + '%';
  if (now.getMinutes() !== lastMinute) {
    lastMinute = now.getMinutes();
    renderTimes(st);
    $('#hijri').textContent = fmt('hijri', now);
    $('#greg').textContent = fmt('greg', now);
  }
}

function openMonth(offset = 0) {
  const base = ymd(new Date(), S.loc.tz);
  let y = base.y, m = base.m + offset;
  while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; }
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthName = new Intl.DateTimeFormat('ar-u-nu-latn', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 15)));
  let rows = '';
  for (let d = 1; d <= days; d++) {
    const t = { y, m, d };
    const tt = dayTimes(t);
    const isToday = y === base.y && m === base.m && d === base.d;
    rows += `<tr class="${isToday ? 'today' : ''}"><td>${esc(fmt('wd', tt.dhuhr))} ${d}<small>${esc(fmt('hijriShort', tt.dhuhr))}</small></td>${PRAYERS.map((p) => `<td>${esc(fmtTime(tt[p.key]))}</td>`).join('')}</tr>`;
  }
  sheet(`<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <button class="icon-btn" id="mPrev" type="button" aria-label="الشهر السابق">${I.prev}</button>
      <h3 style="flex:1;text-align:center;margin:0">${esc(monthName)}</h3>
      <button class="icon-btn" id="mNext" type="button" aria-label="الشهر التالي">${I.next}</button>
    </div>
    <p class="muted" style="margin:0 0 8px;font-size:13px">${esc(S.loc.name)} · ${esc(METHODS[S.method].label)}</p>
    <div class="table-wrap"><table class="month"><thead><tr><th>اليوم</th>${PRAYERS.map((p) => `<th>${p.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`,
  (el) => {
    $('#mPrev', el).onclick = () => openMonth(offset - 1);
    $('#mNext', el).onclick = () => openMonth(offset + 1);
    const tr = $('tr.today', el); if (tr) tr.scrollIntoView({ block: 'center' });
  });
}

/* ---------- Quran ---------- */
let qtab = LS.get('qtab', 'surah');
let qsearch = '';
function quranErr() { toast('تعذر تحميل نص المصحف. أعد المحاولة.'); }
function renderQuran() {
  app.innerHTML = `
  <header class="topbar wrap"><h1>المصحف الشريف</h1></header>
  <main class="view wrap">
    <div id="contWrap"></div>
    <div class="tabs" role="tablist">
      ${[['surah', 'السور'], ['juz', 'الأجزاء'], ['marks', 'العلامات'], ['search', 'بحث']].map(([k, l]) => `<button role="tab" type="button" data-t="${k}" aria-selected="${qtab === k}">${l}</button>`).join('')}
    </div>
    <section class="card" id="qbody"><div class="empty">جارٍ تحميل المصحف…</div></section>
  </main>`;
  $$('.tabs button').forEach((b) => b.onclick = () => { qtab = b.dataset.t; LS.set('qtab', qtab); $$('.tabs button').forEach((x) => x.setAttribute('aria-selected', x === b)); renderQBody(); });
  loadQuran().then(() => {
    if (lastRead) {
      $('#contWrap').innerHTML = `<button class="continue" id="contBtn" type="button">${I.mark}<div><b>متابعة القراءة</b><span>سورة ${esc(surahName(lastRead.s))} · الآية ${arNum(lastRead.a)} · الجزء ${JUZ_NAMES[juzOf(lastRead.s, lastRead.a) - 1]}</span></div></button>`;
      $('#contBtn').onclick = () => openSurah(lastRead.s, lastRead.a);
    }
    renderQBody();
  }).catch(() => { $('#qbody').innerHTML = '<div class="empty">تعذر تحميل نص المصحف. تحقق من الاتصال ثم أعد فتح الصفحة.</div>'; });
}
function renderQBody() {
  const body = $('#qbody'); if (!body || !Q) return;
  if (qtab === 'surah') {
    body.innerHTML = `<ul class="list">${Q.map((s, i) => `<li><button type="button" data-s="${i + 1}"><span class="star">${arNum(i + 1)}</span><span><span class="s-name">${esc(s[0])}</span><br><span class="s-meta">${s[1] === 'm' ? 'مكية' : 'مدنية'} · ${ayahWord(s[2].length)}</span></span><span class="s-count">ج ${arNum(juzOf(i + 1, 1))}</span></button></li>`).join('')}</ul>`;
  } else if (qtab === 'juz') {
    body.innerHTML = `<ul class="list">${JUZ.map(([s, a], i) => `<li><button type="button" data-s="${s}" data-a="${a}"><span class="star">${arNum(i + 1)}</span><span><span class="s-meta">الجزء ${JUZ_NAMES[i]}</span><br><span class="s-name" style="font-size:19px">${esc(Q[s - 1][2][a - 1].split(' ').slice(0, 5).join(' '))}</span></span><span class="s-count">${esc(Q[s - 1][0])} ${arNum(a)}</span></button></li>`).join('')}</ul>`;
  } else if (qtab === 'marks') {
    body.innerHTML = bookmarks.length
      ? `<ul class="list">${bookmarks.map((b) => `<li><button type="button" data-s="${b.s}" data-a="${b.a}"><span class="star">${I.mark.replace('<svg', '<svg width="18" height="18"')}</span><span><span class="s-name" style="font-size:19px">${esc(Q[b.s - 1][2][b.a - 1].split(' ').slice(0, 6).join(' '))}…</span><br><span class="s-meta">سورة ${esc(Q[b.s - 1][0])} · الآية ${arNum(b.a)}</span></span><span></span></button></li>`).join('')}</ul>`
      : '<div class="empty">لا توجد علامات بعد. اضغط على أي آية أثناء القراءة واختر «إضافة علامة».</div>';
  } else {
    body.innerHTML = `<div style="padding:12px"><div class="field"><label for="qsearch">ابحث عن كلمة أو جزء من آية</label><input class="input" id="qsearch" type="search" placeholder="مثال: الصابرين" value="${esc(qsearch)}" autocomplete="off"></div></div><div id="qres"></div>`;
    const inp = $('#qsearch'); let tm;
    const run = () => {
      qsearch = inp.value;
      const res = searchQuran(qsearch);
      const box = $('#qres');
      if (norm(qsearch).length < 2) { box.innerHTML = '<div class="empty">اكتب حرفين على الأقل. البحث لا يتأثر بالتشكيل.</div>'; return; }
      box.innerHTML = res.length
        ? `<p class="muted" style="margin:0 14px 4px;font-size:13px">${res.length >= 150 ? 'أول ١٥٠ نتيجة' : `${arNum(res.length)} نتيجة`}</p>` + res.map(([s, a]) => `<button class="result" type="button" data-s="${s}" data-a="${a}"><span class="ref">${esc(Q[s - 1][0])} · ${arNum(a)}</span><div class="txt">${esc(Q[s - 1][2][a - 1])}</div></button>`).join('')
        : '<div class="empty">لا توجد نتائج مطابقة.</div>';
    };
    inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 220); });
    run();
  }
  body.onclick = (e) => {
    const b = e.target.closest('button[data-s]'); if (!b) return;
    openSurah(Number(b.dataset.s), Number(b.dataset.a || 1));
  };
}

/* ---------- Reader ---------- */
const reader = { open: false, s: 1, el: null, scrollT: 0 };
function openSurah(s, a = 1, opts = {}) {
  reader.s = s; reader.target = a;
  if (location.hash !== '#read') { location.hash = 'read'; } else { showReader(); }
}
function showReader() {
  if (!Q) { loadQuran().then(showReader).catch(quranErr); return; }
  if (!reader.el) {
    reader.el = document.createElement('div');
    reader.el.className = 'reader';
    reader.el.innerHTML = `<div class="reader-bar"><div class="inner wrap">
        <button class="icon-btn" id="rBack" type="button" aria-label="رجوع إلى الفهرس">${I.back}</button>
        <div class="ttl"><b id="rTitle"></b><span id="rSub"></span></div>
        <button class="icon-btn" id="rMenu" type="button" aria-label="خيارات القراءة"><span style="font-family:var(--f-quran);font-size:18px;line-height:1">أ</span></button>
      </div></div>
      <div class="reader-scroll" id="rScroll"><div class="wrap"><article class="page" id="rPage"></article></div></div>`;
    document.body.appendChild(reader.el);
    $('#rBack').onclick = () => history.length > 1 ? history.back() : (location.hash = 'quran');
    $('#rMenu').onclick = readerMenu;
    const sc = $('#rScroll');
    sc.addEventListener('scroll', () => {
      clearTimeout(reader.scrollT);
      reader.scrollT = setTimeout(trackPosition, 350);
    }, { passive: true });
    $('#rPage').addEventListener('click', (e) => {
      const ay = e.target.closest('.ayah'); if (ay) ayahSheet(reader.s, Number(ay.dataset.a));
      const nx = e.target.closest('[data-go]'); if (nx) { reader.s = Number(nx.dataset.go); reader.target = 1; drawSurah(); }
    });
  }
  reader.open = true;
  document.body.style.overflow = 'hidden';
  drawSurah();
}
function hideReader() {
  if (!reader.el) return;
  reader.el.remove(); reader.el = null; reader.open = false;
  document.body.style.overflow = '';
}
function drawSurah() {
  const s = reader.s;
  const [name, type, verses] = Q[s - 1];
  $('#rTitle').textContent = `سورة ${name}`;
  $('#rSub').textContent = `الجزء ${JUZ_NAMES[juzOf(s, reader.target || 1) - 1]}`;
  const juzStarts = {};
  JUZ.forEach(([js, ja], i) => { if (js === s && i > 0) juzStarts[ja] = i + 1; });
  let html = `<header class="surah-head"><b>سورة ${esc(name)}</b><span>${type === 'm' ? 'مكية' : 'مدنية'} · ${ayahWord(verses.length)} · ترتيبها ${arNum(s)}</span></header>`;
  if (s !== 1 && s !== 9) html += '<p class="basmala">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>';
  html += '<div class="mushaf">' + verses.map((v, i) => {
    const a = i + 1;
    const jm = juzStarts[a] ? `<span class="juz-mark">الجزء ${JUZ_NAMES[juzStarts[a] - 1]}</span>` : '';
    return `${jm}<span class="ayah${isMarked(s, a) ? ' marked' : ''}" data-a="${a}">${esc(v)}<span class="an">۝${arNum(a)}</span></span> `;
  }).join('') + '</div>';
  html += `<div class="next-surah">${s > 1 ? `<button class="btn" type="button" data-go="${s - 1}">${I.prev} ${esc(Q[s - 2][0])}</button>` : ''}${s < 114 ? `<button class="btn primary" type="button" data-go="${s + 1}">السورة التالية: ${esc(Q[s][0])} ${I.next}</button>` : ''}</div>`;
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
  if (ay) { const a = Number(ay.dataset.a); setLastRead(reader.s, a); $('#rSub').textContent = `الجزء ${JUZ_NAMES[juzOf(reader.s, a) - 1]} · الآية ${arNum(a)}`; }
}
function setLastRead(s, a) { lastRead = { s, a }; LS.set('lastRead', lastRead); }
function ayahSheet(s, a) {
  const text = Q[s - 1][2][a - 1];
  const marked = isMarked(s, a);
  sheet(`<h3>سورة ${esc(Q[s - 1][0])} · الآية ${arNum(a)}</h3>
    <div class="quote">${esc(text)}</div>
    <div class="sheet-actions">
      <button class="btn" id="aPlay" type="button">${I.play} الاستماع من هذه الآية</button>
      <button class="btn" id="aMark" type="button">${I.mark} ${marked ? 'إزالة العلامة' : 'إضافة علامة'}</button>
      <button class="btn" id="aCopy" type="button">${I.copy} نسخ الآية</button>
    </div>`, (el) => {
    $('#aPlay', el).onclick = () => { closeSheet(); playAyah(s, a); };
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
    <div class="set-row"><div><b>حجم الخط</b><small>يُحفظ تلقائيًا</small></div>
      <div class="stepper"><button type="button" id="fsMinus" aria-label="تصغير">${I.minus}</button><output id="fsOut">${S.qsize}</output><button type="button" id="fsPlus" aria-label="تكبير">${I.plus}</button></div></div>
    <div class="set-row stack"><div class="field"><label for="recSel">القارئ</label><select class="input" id="recSel">${RECITERS.map((r) => `<option value="${r[0]}" ${r[0] === S.reciter ? 'selected' : ''}>${r[1]}</option>`).join('')}</select></div></div>
    <div class="set-row"><div><b>تشغيل السورة من بدايتها</b><small>تلاوة متواصلة آية بعد آية</small></div><button class="btn primary small" id="playAll" type="button">${I.play} تشغيل</button></div>`,
  (el) => {
    const upd = (d) => { S.qsize = Math.min(48, Math.max(20, S.qsize + d)); save(); applyTheme(); $('#fsOut', el).textContent = S.qsize; };
    $('#fsMinus', el).onclick = () => upd(-2);
    $('#fsPlus', el).onclick = () => upd(2);
    $('#recSel', el).onchange = (e) => { S.reciter = e.target.value; save(); if (P.s) playAyah(P.s, P.a); };
    $('#playAll', el).onclick = () => { closeSheet(); playAyah(reader.s, 1); };
  });
}

/* ---------- Qibla ---------- */
function dialSvg(bearing) {
  let ticks = '';
  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0;
    const r1 = major ? 128 : 134;
    ticks += `<line x1="150" y1="${150 - r1}" x2="150" y2="${150 - 142}" transform="rotate(${d} 150 150)" stroke="currentColor" stroke-opacity="${major ? .7 : .3}" stroke-width="${major ? 2 : 1}"/>`;
  }
  const labels = [['ش', 0], ['ق', 90], ['ج', 180], ['غ', 270]].map(([t, d]) =>
    `<text x="${(150 + 108 * Math.sin(rad(d))).toFixed(1)}" y="${(157 - 108 * Math.cos(rad(d))).toFixed(1)}" text-anchor="middle" font-size="19" font-weight="700" fill="${d === 0 ? 'var(--warn)' : 'currentColor'}" font-family="var(--f-display)">${t}</text>`).join('');
  return `<svg viewBox="0 0 300 300" aria-hidden="true" style="color:var(--ink)">
    <circle cx="150" cy="150" r="146" fill="var(--surface-2)" stroke="var(--line)" stroke-width="2"/>
    <circle cx="150" cy="150" r="100" fill="none" stroke="var(--line)" stroke-dasharray="2 5"/>
    ${ticks}${labels}
    <g transform="rotate(${bearing} 150 150)">
      <line x1="150" y1="150" x2="150" y2="54" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(150 66)">
        <rect x="-15" y="-15" width="30" height="30" rx="3" fill="#161616" stroke="var(--brass)" stroke-width="1.5"/>
        <rect x="-15" y="-7" width="30" height="5" fill="var(--brass)"/>
      </g>
    </g>
    <circle cx="150" cy="150" r="9" fill="var(--accent)"/><circle cx="150" cy="150" r="3.5" fill="var(--surface)"/>
  </svg>`;
}
function renderQibla() {
  const b = qiblaBearing();
  const dist = distKm(S.loc, KAABA);
  app.innerHTML = `
  <header class="topbar wrap"><h1>اتجاه القبلة</h1></header>
  <main class="view wrap">
    <section class="card compass-card">
      <div class="compass" id="compass"><div class="pointer" aria-hidden="true"></div><div class="dial" id="dial">${dialSvg(b)}</div></div>
      <div class="qibla-deg">${Math.round(b)}°</div>
      <div class="qibla-hint" id="qHint">زاوية القبلة من الشمال الجغرافي، مع اتجاه عقارب الساعة.</div>
      <button class="btn primary" id="startCompass" type="button">${I.compass} تشغيل البوصلة</button>
      <div class="qibla-facts">
        <div><b>${Math.round(b)}°</b><span>زاوية القبلة</span></div>
        <div><b>${Math.round(dist).toLocaleString('en')}</b><span>كم إلى الكعبة</span></div>
        <div><b id="headingOut">—</b><span>اتجاه الهاتف</span></div>
      </div>
    </section>
    <p class="note">ضع الهاتف مسطّحًا وبعيدًا عن المعادن والمغناطيس، ثم أدِره حتى يلتقي المؤشر العلوي برمز الكعبة. إذا بدا الاتجاه غير مستقر فحرّك الهاتف على شكل الرقم 8 لمعايرة البوصلة. الموقع المستخدم: ${esc(S.loc.name)} (${S.loc.lat.toFixed(3)}, ${S.loc.lng.toFixed(3)}).</p>
  </main>`;
  $('#startCompass').onclick = () => startCompass(b);
}
function startCompass(bearing) {
  const btn = $('#startCompass'); const hint = $('#qHint');
  const begin = () => {
    if (btn) btn.hidden = true;
    hint.textContent = 'جارٍ قراءة المستشعر…';
    let got = false, cum = null, last = null, sx = 0, sy = 0, wasAligned = false;
    const evName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
    const onO = (e) => {
      let hd = null;
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) hd = e.webkitCompassHeading;
      else if ((e.absolute || evName === 'deviceorientationabsolute') && e.alpha != null) hd = 360 - e.alpha;
      if (hd == null) return;
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      hd = (hd + so + 360) % 360;
      sx = sx * 0.75 + Math.cos(rad(hd)) * 0.25; sy = sy * 0.75 + Math.sin(rad(hd)) * 0.25;
      const sm = (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360;
      if (last == null) { cum = sm; } else { cum += ((sm - last + 540) % 360) - 180; }
      last = sm; got = true;
      const dial = $('#dial'); if (!dial) return;
      dial.style.transform = `rotate(${-cum}deg)`;
      $('#headingOut').textContent = Math.round(sm) + '°';
      const diff = ((bearing - sm + 540) % 360) - 180;
      const aligned = Math.abs(diff) < 4;
      $('#compass').classList.toggle('aligned', aligned);
      hint.classList.toggle('ok', aligned);
      hint.textContent = aligned ? 'أنت متجه إلى القبلة' : (diff > 0 ? `استدر يمينًا ${Math.round(diff)}°` : `استدر يسارًا ${Math.round(-diff)}°`);
      if (aligned && !wasAligned && navigator.vibrate) navigator.vibrate(60);
      wasAligned = aligned;
    };
    window.addEventListener(evName, onO);
    let wake = null;
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } catch (e) { /* ignore */ }
    const to = setTimeout(() => {
      if (!got) {
        hint.textContent = 'لم يُعثر على مستشعر بوصلة في هذا الجهاز. استخدم الزاوية المعروضة مع بوصلة أخرى أو على الخريطة.';
        if (btn) btn.hidden = false;
      }
    }, 3000);
    compassCleanup = () => { window.removeEventListener(evName, onO); clearTimeout(to); if (wake) wake.release().catch(() => {}); };
  };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then((r) => { if (r === 'granted') begin(); else hint.textContent = 'لم يُسمح بالوصول إلى مستشعر الاتجاه. فعّله من إعدادات المتصفح.'; })
      .catch(() => { hint.textContent = 'تعذر طلب إذن المستشعر.'; });
  } else if (typeof DeviceOrientationEvent === 'undefined') {
    hint.textContent = 'هذا المتصفح لا يدعم مستشعر الاتجاه.';
  } else begin();
}

/* ---------- Settings ---------- */
function setLoc(loc, quiet) {
  S.loc = loc; save(); fmtCacheClear();
  if (!quiet) toast(`الموقع: ${loc.name}`);
}
function fmtCacheClear() { for (const k of Object.keys(fmtCache)) delete fmtCache[k]; }
function locate(silent) {
  if (!navigator.geolocation) { if (!silent) toast('تحديد الموقع غير متاح في هذا المتصفح. اختر مدينتك من القائمة.'); return; }
  if (!silent) toast('جارٍ تحديد موقعك…', 8000);
  navigator.geolocation.getCurrentPosition((p) => {
    const lat = p.coords.latitude, lng = p.coords.longitude;
    if (silent && S.loc.gps && distKm(S.loc, { lat, lng }) < 2) return;
    const near = nearestCity(lat, lng);
    let name = 'موقعي الحالي';
    if (near && near.d < 35) name = near.c[0];
    else if (near && near.d < 150) name = `قرب ${near.c[0]}`;
    if (!S.methodManual && near && near.d < 600) S.method = near.c[5];
    setLoc({ lat, lng, name, country: near && near.d < 600 ? near.c[1] : '', tz: deviceTz, auto: false, gps: true }, silent);
    route(true);
  }, (err) => {
    if (silent) return;
    toast(err.code === 1 ? 'لم يُسمح بالوصول إلى الموقع. اختر مدينتك من الإعدادات.' : 'تعذر تحديد الموقع. حاول مجددًا أو اختر مدينتك.', 4000);
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600 * 1000 });
}
function renderPrefs() {
  const sw = (id, on, label) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;
  const seg = (name, val, opts) => `<div class="seg" role="group" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${String(val) === String(v)}">${l}</button>`).join('')}</div>`;
  const notifState = !('Notification' in window) ? 'unsupported' : Notification.permission;
  app.innerHTML = `
  <header class="topbar wrap"><h1>الإعدادات</h1></header>
  <main class="view wrap">
    <h2 class="section-title">الموقع</h2>
    <section class="card set-group">
      <div class="set-row"><div><b>${esc(S.loc.name)}</b><small>${esc(S.loc.country || '')} ${S.loc.lat.toFixed(4)}, ${S.loc.lng.toFixed(4)} · ${esc(S.loc.tz)}</small></div>
        <button class="btn small primary" id="gpsBtn" type="button">${I.gps} موقعي</button></div>
      <div class="set-row stack">
        <div class="field"><label for="citySearch">أو اختر مدينة</label><input class="input" id="citySearch" type="search" placeholder="ابحث: وهران، الرياض، باريس…" autocomplete="off"></div>
        <div class="city-results" id="cityResults" hidden></div>
      </div>
      <div class="set-row stack">
        <span class="lbl muted" style="font-size:13px">إحداثيات يدوية</span>
        <div class="grid-2">
          <input class="input" id="latIn" inputmode="decimal" placeholder="خط العرض" value="${S.loc.lat.toFixed(4)}" aria-label="خط العرض" dir="ltr">
          <input class="input" id="lngIn" inputmode="decimal" placeholder="خط الطول" value="${S.loc.lng.toFixed(4)}" aria-label="خط الطول" dir="ltr">
        </div>
        <button class="btn small" id="manualBtn" type="button">اعتماد الإحداثيات</button>
      </div>
    </section>

    <h2 class="section-title">طريقة الحساب</h2>
    <section class="card set-group">
      <div class="set-row stack"><div class="field"><label for="methodSel">الجهة المعتمدة</label>
        <select class="input" id="methodSel">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${k === S.method ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select></div></div>
      <div class="set-row"><div><b>وقت العصر</b><small>الجمهور: ظل المثل · الحنفية: ظل المثلين</small></div>${seg('madhab', S.madhab, [['shafi', 'الجمهور'], ['hanafi', 'الحنفي']])}</div>
      <div class="set-row stack"><div class="field"><label for="hlSel">خطوط العرض العليا</label>
        <select class="input" id="hlSel">
          <option value="auto" ${S.highLat === 'auto' ? 'selected' : ''}>تلقائي (موصى به)</option>
          <option value="middleofthenight" ${S.highLat === 'middleofthenight' ? 'selected' : ''}>منتصف الليل</option>
          <option value="seventhofthenight" ${S.highLat === 'seventhofthenight' ? 'selected' : ''}>سُبع الليل</option>
          <option value="twilightangle" ${S.highLat === 'twilightangle' ? 'selected' : ''}>زاوية الشفق</option>
        </select></div></div>
      <div class="set-row stack"><div><b>تعديل يدوي بالدقائق</b><small>لمطابقة توقيت مسجدك أو الرزنامة المحلية</small></div>
        ${PRAYERS.map((p) => `<div class="set-row" style="padding-block:6px;border:0"><span>${p.name}</span><div class="stepper"><button type="button" data-off="${p.key}" data-d="-1" aria-label="إنقاص دقيقة من ${p.name}">${I.minus}</button><output id="off-${p.key}">${S.offsets[p.key] > 0 ? '+' : ''}${S.offsets[p.key]}</output><button type="button" data-off="${p.key}" data-d="1" aria-label="إضافة دقيقة إلى ${p.name}">${I.plus}</button></div></div>`).join('')}
      </div>
      <div class="set-row"><div><b>تعديل التاريخ الهجري</b><small>حسب رؤية الهلال في بلدك</small></div>
        <div class="stepper"><button type="button" id="hjMinus" aria-label="يوم أقل">${I.minus}</button><output id="hjOut">${S.hijriAdj > 0 ? '+' : ''}${S.hijriAdj}</output><button type="button" id="hjPlus" aria-label="يوم أكثر">${I.plus}</button></div></div>
    </section>

    <h2 class="section-title">الأذان والتنبيهات</h2>
    <section class="card set-group">
      ${FARD.map((k) => `<div class="set-row"><div><b>أذان ${pName(k)}</b></div>${sw('ad-' + k, S.adhan[k], 'أذان ' + pName(k))}</div>`).join('')}
      <div class="set-row stack"><div class="field"><span class="lbl">صوت الأذان</span>${seg('sound', S.sound, [['tone', 'نغمة هادئة'], ['file', 'تسجيل من جهازي'], ['silent', 'تنبيه صامت']])}</div>
        <div id="fileRow" ${S.sound === 'file' ? '' : 'hidden'}>
          <input type="file" id="adhanFile" accept="audio/*" hidden>
          <button class="btn small" id="pickFile" type="button">اختيار ملف أذان (MP3)</button>
          <small class="muted" id="fileName" style="margin-inline-start:8px">${S.soundName ? esc(S.soundName) : 'لم يُختر ملف بعد'}</small>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small" id="testAdhan" type="button">${I.play} تجربة الأذان</button><button class="btn small ghost" id="stopTest" type="button">إيقاف</button></div>
      </div>
      <div class="set-row stack"><div class="field"><label for="remSel">تذكير قبل الأذان</label>
        <select class="input" id="remSel">${[0, 5, 10, 15, 20, 30].map((m) => `<option value="${m}" ${S.reminder === m ? 'selected' : ''}>${m ? 'قبل ' + minutesWord(m) : 'بدون تذكير'}</option>`).join('')}</select></div></div>
      <div class="set-row"><div><b>إشعارات النظام</b><small>${notifState === 'granted' ? 'مفعّلة' : notifState === 'denied' ? 'محظورة من إعدادات المتصفح' : notifState === 'unsupported' ? 'غير مدعومة في هذا المتصفح' : 'تظهر عند حلول وقت الصلاة'}</small></div>
        ${notifState === 'default' ? '<button class="btn small" id="notifBtn" type="button">تفعيل</button>' : ''}</div>
      <div class="set-row"><small>يعمل الأذان ما دام التطبيق مفتوحًا (ولو في الخلفية). ثبّت التطبيق على الشاشة الرئيسية من قائمة المتصفح ليفتح كتطبيق مستقل ويعمل دون إنترنت.</small></div>
    </section>

    <h2 class="section-title">المظهر</h2>
    <section class="card set-group">
      <div class="set-row"><div><b>السمة</b></div>${seg('theme', S.theme, [['auto', 'تلقائي'], ['light', 'فاتح'], ['dark', 'داكن']])}</div>
      <div class="set-row"><div><b>تنسيق الوقت</b></div>${seg('h24', S.h24, [['true', '24 ساعة'], ['false', '12 ساعة']])}</div>
      <div class="set-row stack"><div class="field"><label for="recSel2">قارئ التلاوة</label><select class="input" id="recSel2">${RECITERS.map((r) => `<option value="${r[0]}" ${r[0] === S.reciter ? 'selected' : ''}>${r[1]}</option>`).join('')}</select></div></div>
    </section>

    <p class="about">مِحراب — تُحسب المواقيت على جهازك بمكتبة Adhan (رخصة MIT). نص المصحف برواية حفص بالرسم العثماني من مشروع Tanzil عبر حزمة quran-json (CC BY-SA 4.0)، وخط «أميري قرآن» (رخصة SIL OFL). التلاوات تُبث من خدمة Islamic Network وتحتاج إلى اتصال بالإنترنت.</p>
  </main>`;

  $('#gpsBtn').onclick = () => locate();
  const cs = $('#citySearch'), cr = $('#cityResults');
  cs.addEventListener('input', () => {
    const q = cs.value.trim();
    if (!q) { cr.hidden = true; return; }
    const res = CITIES.filter((c) => c[0].includes(q) || c[1].includes(q)).slice(0, 30);
    cr.hidden = false;
    cr.innerHTML = res.length ? res.map((c) => `<button type="button" data-i="${CITIES.indexOf(c)}"><span>${esc(c[0])}</span><small>${esc(c[1])}</small></button>`).join('') : '<div class="empty">لا توجد مدينة بهذا الاسم. استخدم «موقعي» أو الإحداثيات اليدوية.</div>';
  });
  cr.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    const c = CITIES[Number(b.dataset.i)];
    if (!S.methodManual) S.method = c[5];
    setLoc({ lat: c[2], lng: c[3], name: c[0], country: c[1], tz: c[4], auto: false });
    renderPrefs();
  });
  $('#manualBtn').onclick = () => {
    const lat = parseFloat($('#latIn').value.replace(',', '.')), lng = parseFloat($('#lngIn').value.replace(',', '.'));
    if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) { toast('أدخل إحداثيات صحيحة: العرض بين -90 و90، والطول بين -180 و180.', 4000); return; }
    const near = nearestCity(lat, lng);
    setLoc({ lat, lng, name: near && near.d < 35 ? near.c[0] : 'موقع مخصص', country: near && near.d < 600 ? near.c[1] : '', tz: near && near.d < 600 ? near.c[4] : deviceTz, auto: false });
    renderPrefs();
  };
  $('#methodSel').onchange = (e) => { S.method = e.target.value; S.methodManual = true; save(); toast('تم تحديث طريقة الحساب'); };
  $('#hlSel').onchange = (e) => { S.highLat = e.target.value; save(); };
  $$('[data-off]').forEach((b) => b.onclick = () => {
    const k = b.dataset.off; S.offsets[k] = Math.max(-30, Math.min(30, (S.offsets[k] || 0) + Number(b.dataset.d))); save();
    $('#off-' + k).textContent = (S.offsets[k] > 0 ? '+' : '') + S.offsets[k];
  });
  const hj = (d) => { S.hijriAdj = Math.max(-2, Math.min(2, S.hijriAdj + d)); save(); $('#hjOut').textContent = (S.hijriAdj > 0 ? '+' : '') + S.hijriAdj; };
  $('#hjMinus').onclick = () => hj(-1); $('#hjPlus').onclick = () => hj(1);
  FARD.forEach((k) => { $('#ad-' + k).onchange = (e) => { S.adhan[k] = e.target.checked; save(); }; });
  $$('[data-seg]').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    const name = g.dataset.seg; let v = b.dataset.v;
    if (name === 'h24') v = v === 'true';
    S[name] = v; save();
    $$('button', g).forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (name === 'theme') applyTheme();
    if (name === 'h24') fmtCacheClear();
    if (name === 'sound') $('#fileRow').hidden = v !== 'file';
  }));
  $('#pickFile').onclick = () => $('#adhanFile').click();
  $('#adhanFile').onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 15 * 1024 * 1024) { toast('الملف كبير جدًا. اختر ملفًا أصغر من 15 ميغابايت.'); return; }
    try { await idbPut('adhan', f); S.soundName = f.name; S.sound = 'file'; save(); $('#fileName').textContent = f.name; toast('حُفظ صوت الأذان على جهازك'); }
    catch (err) { toast('تعذر حفظ الملف في هذا المتصفح.'); }
  };
  $('#testAdhan').onclick = () => { arm(); playAdhan(); };
  $('#stopTest').onclick = stopAdhan;
  $('#remSel').onchange = (e) => { S.reminder = Number(e.target.value); save(); };
  $('#recSel2').onchange = (e) => { S.reciter = e.target.value; save(); };
  const nb = $('#notifBtn');
  if (nb) nb.onclick = () => Notification.requestPermission().then(() => renderPrefs());
}

/* ---------- router ---------- */
const VIEWS = { home: renderHome, quran: renderQuran, qibla: renderQibla, prefs: renderPrefs };
function route(force) {
  let r = location.hash.replace('#', '') || 'home';
  const isRead = r === 'read';
  if (isRead) r = 'quran';
  if (!VIEWS[r]) r = 'home';
  if (current !== r || force === true) {
    if (compassCleanup) { compassCleanup(); compassCleanup = null; }
    current = r; setTab(r);
    VIEWS[r]();
    window.scrollTo(0, 0);
  }
  if (isRead) showReader(); else { hideReader(); }
}
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
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
loadQuran().catch(() => {});

// Refresh GPS position silently when the permission was already granted.
if (S.loc.gps || S.loc.auto) {
  try {
    if (navigator.permissions && navigator.geolocation) navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') locate(true); }).catch(() => {});
  } catch (e) { /* ignore */ }
}

if ('serviceWorker' in navigator && location.protocol === 'https:' ) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
})();
