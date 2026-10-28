// قوالب العناوين والأوصاف — صيغت حسب ما يكتبه التلاميذ في جوجل
import { levelById, stages, subjects, type Level, type StageId } from './catalog';
import { countOf } from './content';
import type { Locale } from './site';

export function levelSeo(l: Locale, lv: Level) {
  const n = countOf(lv.id);
  if (l === 'ar') {
    if (lv.exam)
      return {
        h1: `التحضير ل${lv.name.ar}: مواضيع مع الحلول`,
        title: `مواضيع ${lv.name.ar} ${lv.short.ar} مع التصحيح لكل المواد PDF`,
        description: `مواضيع تجريبية للتحضير ل${lv.name.ar} (${lv.short.ar}) مع الحلول المفصلة، على نمط الامتحان الرسمي، في كل المواد. اقرأها على الصفحة أو حمّلها PDF مجانًا.`,
      };
    return {
      h1: `فروض واختبارات ${lv.name.ar} مع الحلول`,
      title: `فروض واختبارات ${lv.name.ar} مع الحلول — كل المواد`,
      description: `نماذج فروض واختبارات ${lv.name.ar} للفصل الأول والثاني والثالث مع الحلول، ودروس وملخصات في كل المواد وفق المنهاج الجزائري${n ? ` (${n} ملف)` : ''}. تحميل PDF مجاني.`,
    };
  }
  if (l === 'fr') {
    if (lv.exam)
      return { h1: `Préparer le ${lv.name.fr} : sujets corrigés`, title: `Sujets ${lv.name.fr} corrigés — toutes matières (PDF)`, description: `Sujets types pour préparer le ${lv.name.fr}, avec corrigés détaillés, dans toutes les matières. PDF gratuit.` };
    return { h1: `Devoirs et examens ${lv.name.fr} avec corrigés`, title: `Devoirs et examens ${lv.short.fr} corrigés — ${lv.name.fr}`, description: `Devoirs et examens des 1er, 2e et 3e trimestres de ${lv.name.fr} avec corrigés, cours et résumés dans toutes les matières. PDF gratuit.` };
  }
  if (lv.exam)
    return { h1: `${lv.name.en} preparation: papers with answers`, title: `${lv.name.en} mock papers with answers — all subjects`, description: `Mock papers to prepare for the ${lv.name.en}, with full answers, in every subject. Free PDF.` };
  return { h1: `${lv.name.en} tests and exams with answers`, title: `${lv.name.en} (${lv.short.en}) tests and exams with answers`, description: `Term 1, 2 and 3 tests and exams for ${lv.name.en} with answers, plus lessons and summaries in every subject. Free PDF.` };
}

export function subjectSeo(l: Locale, lv: Level, subjectId: string) {
  const s = subjects[subjectId].name;
  if (l === 'ar') {
    if (lv.exam)
      return {
        h1: `مواضيع ${lv.name.ar} في ${s.ar} مع الحلول`,
        title: `مواضيع ${lv.short.ar} ${s.ar} مع التصحيح — ${lv.name.ar}`,
        description: `كل مواضيع ${lv.name.ar} في مادة ${s.ar} للسنوات السابقة مع الحلول النموذجية، مرتبة حسب السنة. معاينة وتحميل PDF مجاني.`,
      };
    return {
      h1: `${s.ar} — ${lv.name.ar}: فروض، اختبارات ودروس`,
      title: `فروض واختبارات ${s.ar} ${lv.name.ar} مع الحلول`,
      description: `فروض واختبارات مادة ${s.ar} ${lv.name.ar} للفصول الثلاثة مع الحلول، إضافة إلى دروس وملخصات وسلاسل تمارين. تحميل PDF مجاني.`,
    };
  }
  if (l === 'fr')
    return lv.exam
      ? { h1: `Sujets ${lv.name.fr} ${s.fr} avec corrigés`, title: `Sujets ${lv.short.fr} ${s.fr} corrigés`, description: `Tous les sujets du ${lv.name.fr} en ${s.fr} avec corrigés, classés par année. PDF gratuit.` }
      : { h1: `${s.fr} — ${lv.name.fr} : devoirs, examens et cours`, title: `Devoirs et examens ${s.fr} ${lv.short.fr} avec corrigés`, description: `Devoirs et examens de ${s.fr} en ${lv.name.fr} pour les trois trimestres, avec corrigés, cours et résumés. PDF gratuit.` };
  return lv.exam
    ? { h1: `${lv.name.en} ${s.en} papers with answers`, title: `${lv.short.en} ${s.en} past papers with answers`, description: `All ${lv.name.en} ${s.en} papers with model answers, sorted by year. Free PDF.` }
    : { h1: `${s.en} — ${lv.name.en}: tests, exams and lessons`, title: `${s.en} ${lv.short.en} tests and exams with answers`, description: `${s.en} tests and exams for ${lv.name.en}, all three terms, with answers, lessons and summaries. Free PDF.` };
}

export function stageSeo(l: Locale, id: StageId) {
  const name = stages[id].name[l];
  const lvls = stages[id].levels.map((x) => levelById(x)!.short[l]).join('، ');
  if (l === 'ar') return { h1: `${name}: فروض واختبارات ودروس`, title: `فروض واختبارات ${name} مع الحلول`, description: `فروض واختبارات ودروس ${name} مع الحلول لكل المستويات (${lvls}) وفق المنهاج الجزائري. تحميل مجاني.` };
  if (l === 'fr') return { h1: `${name} : devoirs, examens et cours`, title: `Devoirs et examens corrigés — ${name}`, description: `Devoirs, examens et cours corrigés pour tous les niveaux de l’${name.toLowerCase()} en Algérie.` };
  return { h1: `${name}: tests, exams and lessons`, title: `${name} tests and exams with answers`, description: `Tests, exams and lessons with answers for every ${name.toLowerCase()} level in Algeria.` };
}
