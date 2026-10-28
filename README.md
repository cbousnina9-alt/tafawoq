# تفوّق — موقع فروض واختبارات (Next.js)

موقع جزائري للفروض والاختبارات والدروس، مبني بـ Next.js 16، كل الصفحات تُولَّد مسبقًا (سريع جدًا وممتاز للسيو)، بثلاث لغات (ar / fr / en).

## التشغيل على جهازك

```bash
npm install
npm run dev        # http://localhost:3000/ar
```

## لوحة التحكم (الأسهل) — /admin/

ادخل إلى `https://موقعكم/admin/` وسجّل الدخول بحساب GitHub.
- **المواضيع (PDF):** اضغط «New موضوع»، اختر المستوى والمادة والنوع، ارفع ملف PDF (والحل إن وجد)، ثم **Publish**.
- **المقالات:** نفس الطريقة، مع محرر نص.
- يظهر التحديث في الموقع بعد 2 إلى 3 دقائق (Netlify يعيد البناء تلقائيًا).

الإعداد لأول مرة (مرة واحدة):
1. الموقع على GitHub ومربوط بـ Netlify (Import from Git).
2. أنشئ OAuth App في GitHub: https://github.com/settings/developers ← New OAuth App
   - Homepage URL: `https://tafawoq.site`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
3. في Netlify: Site configuration ← Access & security ← OAuth ← Install provider ← GitHub، وألصق Client ID و Client Secret.
4. إذا تغيّر اسم المستودع، عدّل `repo` في `public/admin/config.yml`.

## إضافة ملفات يدويًا

1. ضع ملف PDF في المجلد المناسب:
   ```
   public/files/<المستوى>/<المادة>/<النوع>/<الاسم>.pdf
   ```
   - **المستويات:** `0ap 1ap 2ap 3ap 4ap 5ap 1am 2am 3am 4am bem 1as 2as 3as bac`
   - **المواد:** `arabic math french english islamic civic scientific history geography history-geo science physics tamazight informatics philosophy economics accounting law engineering german spanish italian`
   - **الأنواع:** `lesson` درس، `summary` ملخص، `exercises` تمارين، `test` فرض، `exam` اختبار، `mock` موضوع تجريبي، `official` موضوع رسمي (BEM/BAC الحقيقية فقط)
2. سمِّ الملف هكذا ليُولَّد العنوان تلقائيًا:
   - `t1-2025-1.pdf` ← الفصل الأول، 2025، النموذج 1
   - `t1-2025-1-sol.pdf` ← حله (يُربط تلقائيًا)
   - `2024.pdf` في `bac/math/official` ← موضوع بكالوريا 2024
3. شغّل `npm run index` (يحدث تلقائيًا مع `npm run build`).

عنوان أو وصف مخصص لملف: أضفه في `content/resources.extra.json`:
```json
{
  "1as/physics/lesson-mouvement": { "title": { "ar": "درس الحركة والسكون — السنة الأولى ثانوي" } }
}
```

## كتابة موضوع جديد بنفسك (HTML → PDF)

المواضيع التي أعدّها الموقع موجودة في `content/papers/` كملفات HTML بسيطة (الرياضيات بين `$...$`).
لإضافة موضوع: انسخ ملفًا موجودًا، عدّل التمارين والحل، ثم شغّل:
```bash
npm run papers   # يولّد PDF للموضوع وللحل في public/files
npm run index
```
(يحتاج Playwright: `npx playwright install chromium` مرة واحدة على جهازك.)

**سلم التنقيط (مثل الإجابة النموذجية الرسمية):** في قسم الحل، أعطِ كل تمرين `data-total` وكل سطر `data-pts`، فيتحول تلقائيًا إلى جدول «عناصر الإجابة | العلامة مجزأة | المجموع»:
```html
<div class="ex" data-total="3">
<h2>التمرين الأول</h2>
<p data-pts="0.5">1) ...</p>
<p data-pts="2×0.25">2) ...</p>
</div>
```
السكربت ينبّه إذا كان مجموع العلامات المجزأة لا يساوي `data-total`.

## إضافة مقال

ملف Markdown في `content/articles/` مع الترويسة:
```
---
title: عنوان المقال
description: وصف قصير يظهر في جوجل
category: advice   # advice | news | teachers | stories | enigmes | islam
lang: ar
date: 2026-10-26
---
```

## قبل الإطلاق ✅

- [ ] راجع المواضيع المعدّة في `content/papers` مع أستاذ قبل النشر
- [ ] غيّر الاسم في `lib/site.ts` إذا اخترتم اسمًا آخر
- [ ] انسخ `.env.example` إلى متغيرات البيئة في الاستضافة وعبّئ الدومين و GA
- [ ] راجع نصوص `lib/pages.ts` (من نحن، الخصوصية، الشروط) وضع بريدكم الحقيقي
- [ ] بعد قبول AdSense: ضع `ca-pub-...` وأرقام الوحدات، وعدّل `public/ads.txt`

## النشر على Netlify بالسحب (الأسهل)

```bash
NEXT_PUBLIC_SITE_URL=https://اسم-موقعكم.netlify.app npm run build:static
```
ثم اسحب مجلد `out` إلى https://app.netlify.com/drop . عند كل تحديث: Deploys ← اسحب مجلد `out` الجديد.

## النشر على Vercel (مجاني)

1. ارفع المجلد إلى مستودع GitHub.
2. من vercel.com ← New Project ← اختر المستودع ← Deploy.
3. أضف متغيرات البيئة من `.env.example` في Settings ← Environment Variables.
4. اربط الدومين من Settings ← Domains.
5. في Google Search Console: أضف الموقع وأرسل `https://دومينكم/sitemap.xml`.

> عندما يتجاوز حجم الملفات 1–2 GB، انقلوا مجلد `files` إلى Cloudflare R2 (تخزين رخيص بدون رسوم تحميل) وغيّروا الروابط.

## البنية

```
app/[locale]/                      الرئيسية
app/[locale]/[section]/            طور (ep/em/es) أو مستوى (4am) أو قسم مقالات
app/[locale]/[section]/[sub]/      مادة (4am/math) أو مقال
app/[locale]/[section]/[sub]/[item] صفحة الملف (معاينة + تحميل + حل)
app/sitemap.ts  app/robots.ts      السيو
lib/catalog.ts                     المستويات والمواد
lib/seo.ts                         قوالب العناوين والأوصاف
components/AdSlot.tsx              أماكن الإعلانات
```
