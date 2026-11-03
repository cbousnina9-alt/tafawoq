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
      html: `<p>${n.ar} منصة جزائرية مجانية للدعم المدرسي، هدفها أن يجد كل تلميذ نماذج فروض واختبارات بالحل في مكان واحد، مرتبة حسب مستواه ومادته، من القسم التحضيري إلى السنة الثالثة ثانوي.</p>
<h2>ماذا نقدم؟</h2>
<ul><li>نماذج فروض واختبارات مع الحل المفصل وسلم التنقيط، مطابقة لمحاور المنهاج الجزائري.</li><li>مواضيع تجريبية على نمط شهادة التعليم المتوسط والبكالوريا للتدريب، مع الحلول.</li><li>سلاسل تمارين في بعض المواد.</li><li>مقالات ونصائح في المراجعة والتحضير للامتحانات.</li></ul>
<p>كل موضوع متوفر مكتوبًا على صفحته، ويمكن تحميله PDF مع ملف الحل.</p>
<h2>من يكتب المحتوى؟</h2>
<p>المواضيع المنشورة حاليًا مواضيع مقترحة يكتبها فريق الموقع، وليست مواضيع رسمية صادرة عن وزارة التربية أو الديوان الوطني للامتحانات والمسابقات. نراجع التنقيط والحلول قبل النشر، ونصحح أي خطأ يُبلَّغ عنه.</p>
<p>يمكن للأساتذة والتلاميذ مشاركة مواضيعهم من صفحة «أرسل موضوعًا»، ولا ننشر إلا ما يملك صاحبه حق مشاركته، مع ذكر اسمه إن أراد. إذا وجدت محتوى تملك حقوقه ولا ترغب في نشره، راسلنا وسنحذفه.</p>`,
    },
    fr: { title: 'À propos', description: `Découvrez ${n.fr}.`, html: `<p>${n.fr} est une plateforme algérienne gratuite de soutien scolaire : devoirs et examens avec corrigés détaillés et barème, et sujets types pour préparer le BEM et le BAC, pour tous les niveaux, conformes au programme national.</p><p>Les sujets publiés sont des sujets proposés, rédigés par notre équipe ; ce ne sont pas des sujets officiels du ministère ou de l’ONEC. Les enseignants et élèves peuvent aussi partager leurs sujets ; chaque fichier est vérifié avant publication.</p>` },
    en: { title: 'About us', description: `About ${n.en}.`, html: `<p>${n.en} is a free Algerian study-support platform: tests and exams with full answers and marking schemes, plus practice papers for the BEM and BAC, for every school level, following the national curriculum.</p><p>The papers are proposed papers written by our team; they are not official papers from the Ministry of Education or ONEC. Teachers and students can also share their papers; every file is reviewed before publication.</p>` },
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
<p>نستعمل خدمة Google AdSense لعرض الإعلانات التي تساعدنا على إبقاء الموقع مجانيًا.</p>
<ul><li>يستعمل مورّدون خارجيون، ومن بينهم Google، ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى على الإنترنت.</li><li>تتيح ملفات تعريف الارتباط الإعلانية الخاصة بـ Google لها ولشركائها عرض إعلانات لك بناءً على زيارتك لهذا الموقع و/أو لمواقع أخرى.</li><li>يمكنك إيقاف الإعلانات المخصّصة من <a href="https://adssettings.google.com" rel="nofollow noopener">إعدادات الإعلانات في Google</a>، كما يمكنك إيقاف ملفات تعريف الارتباط الخاصة بالمورّدين الآخرين للإعلانات المخصّصة من <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>.</li><li>قد تُعرض الإعلانات أيضًا عن طريق مورّدين وشبكات إعلانية خارجية معتمدة لدى Google. قائمتهم ومواقعهم متوفرة في صفحة <a href="https://support.google.com/admanager/answer/94149" rel="nofollow noopener">شركاء الإعلانات المعتمدين لدى Google</a>، ويمكنك إيقاف الإعلانات المخصّصة لديهم من مواقعهم أو من <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>.</li></ul>
<p>لمعرفة طريقة استعمال Google للبيانات: <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">كيف تستخدم Google المعلومات من المواقع والتطبيقات التي تستعمل خدماتها</a>.</p>
<h2>الإحصاءات</h2>
<p>نستعمل Google Analytics لمعرفة عدد الزوار والصفحات الأكثر زيارة، دون معرفة هويتك. يمكنك منع ذلك بإضافة <a href="https://tools.google.com/dlpage/gaoptout" rel="nofollow noopener">أداة إيقاف Google Analytics</a> إلى متصفحك.</p>
<h2>الموافقة على ملفات تعريف الارتباط</h2>
<p>إذا كنت تزور الموقع من الاتحاد الأوروبي أو المملكة المتحدة أو سويسرا، تُعرض عليك رسالة موافقة قبل استعمال ملفات تعريف الارتباط الإعلانية، ويمكنك قبولها أو رفضها. يمكنك أيضًا حذف ملفات تعريف الارتباط أو منعها في أي وقت من إعدادات متصفحك.</p>
<h2>الأطفال</h2>
<p>الموقع موجّه للتلاميذ وأوليائهم. لا نطلب إنشاء حساب ولا نجمع عمدًا بيانات شخصية عن الأطفال.</p>
<h2>التواصل</h2>
<p>لأي سؤال حول الخصوصية: <a href="mailto:${email}">${email}</a></p>`,
    },
    fr: {
      title: 'Politique de confidentialité',
      description: `Données, cookies et publicités sur ${n.fr}.`,
      html: `<p>Dernière mise à jour : ${new Date().toISOString().slice(0, 10)}</p>
<h2>Données collectées</h2>
<ul><li><strong>Navigation :</strong> type d’appareil, navigateur et pages visitées, via Google Analytics, pour améliorer le site.</li><li><strong>Données que vous envoyez :</strong> nom, e-mail et message lorsque vous nous écrivez ou envoyez un sujet. Nous ne publions jamais votre e-mail.</li><li><strong>Favoris :</strong> stockés uniquement dans votre navigateur.</li></ul>
<h2>Cookies et publicité</h2>
<ul><li>Des fournisseurs tiers, dont Google, utilisent des cookies pour diffuser des annonces en fonction de vos visites antérieures sur ce site ou sur d’autres sites.</li><li>Les cookies publicitaires de Google permettent à Google et à ses partenaires de diffuser des annonces en fonction de vos visites sur ce site et/ou d’autres sites Internet.</li><li>Vous pouvez désactiver la publicité personnalisée dans les <a href="https://adssettings.google.com" rel="nofollow noopener">paramètres des annonces Google</a>, ou désactiver les cookies des fournisseurs tiers sur <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>.</li><li>Des fournisseurs et réseaux publicitaires tiers certifiés par Google peuvent aussi diffuser des annonces : voir la <a href="https://support.google.com/admanager/answer/94149" rel="nofollow noopener">liste des partenaires publicitaires de Google</a>.</li></ul>
<p>Plus d’informations : <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">comment Google utilise les données des sites partenaires</a>.</p>
<h2>Consentement</h2>
<p>Les visiteurs de l’Union européenne, du Royaume-Uni et de Suisse voient un message de consentement avant l’utilisation des cookies publicitaires. Vous pouvez aussi bloquer ou supprimer les cookies dans votre navigateur. Pour Google Analytics : <a href="https://tools.google.com/dlpage/gaoptout" rel="nofollow noopener">module de désactivation</a>.</p>
<h2>Enfants</h2>
<p>Le site s’adresse aux élèves et à leurs parents. Aucun compte n’est demandé et nous ne collectons pas sciemment de données personnelles d’enfants.</p>
<h2>Contact</h2>
<p><a href="mailto:${email}">${email}</a></p>`,
    },
    en: {
      title: 'Privacy policy',
      description: `Data, cookies and ads on ${n.en}.`,
      html: `<p>Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<h2>Data we collect</h2>
<ul><li><strong>Browsing data:</strong> device type, browser and pages visited, through Google Analytics, to improve the site.</li><li><strong>Data you send us:</strong> name, email and message when you contact us or send a paper. We never publish your email.</li><li><strong>Favorites:</strong> stored only in your browser.</li></ul>
<h2>Cookies and advertising</h2>
<ul><li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.</li><li>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li><li>You may opt out of personalised advertising in <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>, or opt out of third-party vendors’ cookies at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>.</li><li>Ads may also be served by third-party vendors and ad networks certified by Google: see <a href="https://support.google.com/admanager/answer/94149" rel="nofollow noopener">Google’s list of certified ad partners</a>.</li></ul>
<p>More information: <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener">how Google uses data from partner sites</a>.</p>
<h2>Consent</h2>
<p>Visitors from the European Union, the United Kingdom and Switzerland see a consent message before advertising cookies are used. You can also block or delete cookies in your browser. For Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" rel="nofollow noopener">opt-out add-on</a>.</p>
<h2>Children</h2>
<p>The site is for pupils and their parents. No account is required and we do not knowingly collect personal data from children.</p>
<h2>Contact</h2>
<p><a href="mailto:${email}">${email}</a></p>`,
    },
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
