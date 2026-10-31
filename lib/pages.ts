// نصوص الصفحات الثابتة — راجعها وعدّلها حسب معلوماتكم الحقيقية قبل الإطلاق
import { site, type Locale } from './site';

type Page = { title: string; description: string; html: string };
const n = site.name;
const email = site.contactEmail;

export const pages: Record<string, Record<Locale, Page>> = {
  about: {
    ar: {
      title: 'من نحن',
      description: `تعرّف على منصة ${n.ar}: هدفها، محتواها وطريقة عملها.`,
      html: `<p>${n.ar} منصة جزائرية مجانية للدعم المدرسي، هدفها أن يجد كل تلميذ نماذج الفروض والاختبارات والدروس التي يحتاجها في مكان واحد، مرتبة حسب مستواه ومادته.</p>
<h2>ماذا نقدم؟</h2>
<ul><li>فروض واختبارات للفصول الثلاثة في كل المواد، من التحضيري إلى الثالثة ثانوي.</li><li>المواضيع الرسمية لشهادة التعليم المتوسط والبكالوريا مع الحلول.</li><li>دروس، ملخصات وسلاسل تمارين وفق المنهاج الوطني.</li><li>مقالات ونصائح للتلاميذ والأولياء.</li></ul>
<h2>مصدر المحتوى</h2>
<p>ينشر المحتوى فريق الموقع وأساتذة وتلاميذ يشاركون مواضيعهم. نراجع كل ملف قبل نشره، وننسب الملف لصاحبه متى أراد ذلك. إذا وجدت ملفًا تملك حقوقه ولا ترغب في نشره، راسلنا وسنحذفه فورًا.</p>`,
    },
    fr: { title: 'À propos', description: `Découvrez ${n.fr}.`, html: `<p>${n.fr} est une plateforme algérienne gratuite de soutien scolaire qui rassemble devoirs, examens, sujets officiels et cours pour tous les niveaux, conformes au programme national.</p><p>Les contenus sont publiés par notre équipe et par des enseignants et élèves qui partagent leurs sujets. Chaque fichier est vérifié avant publication.</p>` },
    en: { title: 'About us', description: `About ${n.en}.`, html: `<p>${n.en} is a free Algerian study-support platform that gathers tests, exams, official papers and lessons for every school level, following the national curriculum.</p><p>Content is published by our team and by teachers and students who share their papers. Every file is reviewed before publication.</p>` },
  },
  'privacy-policy': {
    ar: {
      title: 'سياسة الخصوصية',
      description: `كيف يجمع ${n.ar} البيانات ويستعملها، وملفات تعريف الارتباط والإعلانات.`,
      html: `<p>آخر تحديث: ${new Date().toISOString().slice(0, 10)}</p>
<p>نحترم خصوصية زوارنا. توضح هذه الصفحة البيانات التي نجمعها وكيف نستعملها.</p>
<h2>البيانات التي نجمعها</h2>
<ul><li><strong>بيانات التصفح:</strong> مثل نوع الجهاز والمتصفح والصفحات المزارة، عبر أدوات إحصاء مثل Google Analytics، لتحسين الموقع.</li><li><strong>بيانات تقدمها بنفسك:</strong> عند مراسلتنا أو إرسال ملف (الاسم، البريد الإلكتروني، الرسالة). تصل المواضيع المرسلة إلى إدارة الموقع وحدها (عبر خدمة مراسلة آمنة)، ولا ننشر منها إلا نص الموضوع، ولا نعرض اسمك إلا إذا طلبت ذلك، ولا ننشر بريدك الإلكتروني أبدًا.</li><li><strong>المفضلة:</strong> تُحفظ في متصفحك فقط ولا تصلنا.</li></ul>
<h2>ملفات تعريف الارتباط (Cookies) والإعلانات</h2>
<p>نستعمل خدمة Google AdSense لعرض الإعلانات. تستخدم Google وشركاؤها ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك السابقة لهذا الموقع أو مواقع أخرى. يمكنك إيقاف الإعلانات المخصصة من <a href="https://adssettings.google.com" rel="nofollow noopener">إعدادات الإعلانات في Google</a>، أو زيارة <a href="https://www.aboutads.info" rel="nofollow noopener">aboutads.info</a>.</p>
<p>لمزيد من المعلومات حول طريقة استعمال Google للبيانات: <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">كيف تستخدم Google المعلومات من المواقع الشريكة</a>.</p>
<h2>الأطفال</h2>
<p>الموقع موجّه للتلاميذ وأوليائهم. لا نطلب إنشاء حساب ولا نجمع عمدًا بيانات شخصية عن الأطفال.</p>
<h2>التواصل</h2>
<p>لأي سؤال حول الخصوصية: <a href="mailto:${email}">${email}</a></p>`,
    },
    fr: { title: 'Politique de confidentialité', description: 'Données, cookies et publicités.', html: `<p>Nous utilisons Google Analytics pour mesurer l’audience et Google AdSense pour afficher des publicités. Google et ses partenaires utilisent des cookies pour diffuser des annonces basées sur vos visites. Vous pouvez désactiver la publicité personnalisée via les <a href="https://adssettings.google.com" rel="nofollow noopener">paramètres des annonces Google</a>.</p><p>Les favoris sont stockés uniquement dans votre navigateur. Contact : <a href="mailto:${email}">${email}</a></p>` },
    en: { title: 'Privacy policy', description: 'Data, cookies and ads.', html: `<p>We use Google Analytics to measure traffic and Google AdSense to show ads. Google and its partners use cookies to serve ads based on your visits. You can opt out of personalised ads in <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p><p>Favorites are stored only in your browser. Contact: <a href="mailto:${email}">${email}</a></p>` },
  },
  terms: {
    ar: {
      title: 'شروط الاستخدام',
      description: `شروط استخدام موقع ${n.ar}.`,
      html: `<p>باستخدامك للموقع فإنك توافق على هذه الشروط.</p>
<ul><li>المحتوى مقدم مجانًا للاستعمال الشخصي والتعليمي.</li><li>لا يجوز إعادة نشر الملفات على مواقع أخرى دون إذن.</li><li>عند إرسال ملف، تؤكد أنك صاحبه أو أن لديك حق مشاركته.</li><li>نبذل جهدنا لضمان صحة الحلول، لكن قد ترد أخطاء؛ راسلنا لتصحيحها.</li><li>لأصحاب الحقوق: إذا وجدت محتوى يخصك وتريد حذفه، راسلنا على <a href="mailto:${email}">${email}</a> وسنستجيب في أقرب وقت.</li></ul>`,
    },
    fr: { title: 'Conditions d’utilisation', description: 'Conditions d’utilisation.', html: `<p>Les contenus sont fournis gratuitement pour un usage personnel et éducatif. Toute republication sans autorisation est interdite. Ayants droit : écrivez-nous à <a href="mailto:${email}">${email}</a> pour tout retrait.</p>` },
    en: { title: 'Terms of use', description: 'Terms of use.', html: `<p>Content is provided free for personal and educational use. Republishing without permission is not allowed. Rights holders can request removal at <a href="mailto:${email}">${email}</a>.</p>` },
  },
};

export const faqs: Record<Locale, { q: string; a: string }[]> = {
  ar: [
    { q: 'هل التحميل مجاني؟', a: 'نعم، كل الملفات مجانية ولا تحتاج إلى حساب.' },
    { q: 'كيف أجد اختبار مادة معينة؟', a: 'اختر مستواك من الصفحة الرئيسية، ثم المادة، ثم استعمل أزرار التصفية حسب النوع والفصل. يمكنك أيضًا استعمال البحث بكتابة اسم المادة والمستوى.' },
    { q: 'المعاينة لا تظهر على هاتفي، ماذا أفعل؟', a: 'بعض متصفحات الهاتف لا تعرض ملفات PDF داخل الصفحة. اضغط على زر «تحميل الموضوع» وسيفتح الملف مباشرة.' },
    { q: 'كيف أشارك موضوعًا أو حلًا؟', a: 'من صفحة «شارك موضوعًا» أرسل الملف مع المستوى والمادة. نراجعه وننشره، ويمكننا ذكر اسمك.' },
    { q: 'وجدت خطأ في أحد الحلول.', a: 'راسلنا من صفحة «اتصل بنا» مع رابط الملف ورقم السؤال، وسنصححه.' },
  ],
  fr: [
    { q: 'Le téléchargement est-il gratuit ?', a: 'Oui, tous les fichiers sont gratuits, sans inscription.' },
    { q: 'Comment partager un sujet ?', a: 'Via la page « Partager un sujet ». Nous le vérifions puis le publions.' },
  ],
  en: [
    { q: 'Are downloads free?', a: 'Yes, every file is free and no account is needed.' },
    { q: 'How can I share a paper?', a: 'Use the “Share a paper” page. We review it and publish it.' },
  ],
};
