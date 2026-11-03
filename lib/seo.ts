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
      description: `نماذج فروض واختبارات ${lv.name.ar} مع الحلول المفصلة وسلم التنقيط، في كل المواد وفق المنهاج الجزائري${n ? ` (${n} موضوع)` : ''}. اقرأها على الصفحة أو حمّلها PDF مجانًا.`,
    };
  }
  if (l === 'fr') {
    if (lv.exam)
      return { h1: `Préparer le ${lv.name.fr} : sujets corrigés`, title: `Sujets ${lv.name.fr} corrigés — toutes matières (PDF)`, description: `Sujets types pour préparer le ${lv.name.fr}, avec corrigés détaillés, dans toutes les matières. PDF gratuit.` };
    return { h1: `Devoirs et examens ${lv.name.fr} avec corrigés`, title: `Devoirs et examens ${lv.short.fr} corrigés — ${lv.name.fr}`, description: `Devoirs et examens de ${lv.name.fr} avec corrigés détaillés et barème, dans toutes les matières, conformes au programme algérien. PDF gratuit.` };
  }
  if (lv.exam)
    return { h1: `${lv.name.en} preparation: papers with answers`, title: `${lv.name.en} mock papers with answers — all subjects`, description: `Mock papers to prepare for the ${lv.name.en}, with full answers, in every subject. Free PDF.` };
  return { h1: `${lv.name.en} tests and exams with answers`, title: `${lv.name.en} (${lv.short.en}) tests and exams with answers`, description: `Tests and exams for ${lv.name.en} with full answers and marking schemes, in every subject, following the Algerian curriculum. Free PDF.` };
}

export function subjectSeo(l: Locale, lv: Level, subjectId: string) {
  const s = subjects[subjectId].name;
  if (l === 'ar') {
    if (lv.exam)
      return {
        h1: `مواضيع ${lv.name.ar} في ${s.ar} مع الحلول`,
        title: `مواضيع ${lv.short.ar} ${s.ar} مع التصحيح — ${lv.name.ar}`,
        description: `مواضيع تجريبية على نمط ${lv.name.ar} في مادة ${s.ar} مع الحلول النموذجية وسلم التنقيط. اقرأها على الصفحة أو حمّلها PDF مجانًا.`,
      };
    return {
      h1: `${s.ar} — ${lv.name.ar}: فروض واختبارات مع الحلول`,
      title: `فروض واختبارات ${s.ar} ${lv.name.ar} مع الحلول`,
      description: `فروض واختبارات مادة ${s.ar} ${lv.name.ar} مع الحلول المفصلة وسلم التنقيط، وفق المنهاج الجزائري. اقرأها على الصفحة أو حمّلها PDF مجانًا.`,
    };
  }
  if (l === 'fr')
    return lv.exam
      ? { h1: `Sujets ${lv.name.fr} ${s.fr} avec corrigés`, title: `Sujets ${lv.short.fr} ${s.fr} corrigés`, description: `Sujets types du ${lv.name.fr} en ${s.fr} avec corrigés détaillés et barème. PDF gratuit.` }
      : { h1: `${s.fr} — ${lv.name.fr} : devoirs et examens corrigés`, title: `Devoirs et examens ${s.fr} ${lv.short.fr} avec corrigés`, description: `Devoirs et examens de ${s.fr} en ${lv.name.fr} avec corrigés détaillés et barème. PDF gratuit.` };
  return lv.exam
    ? { h1: `${lv.name.en} ${s.en} papers with answers`, title: `${lv.short.en} ${s.en} practice papers with answers`, description: `${lv.name.en}-style ${s.en} practice papers with model answers and marking schemes. Free PDF.` }
    : { h1: `${s.en} — ${lv.name.en}: tests and exams with answers`, title: `${s.en} ${lv.short.en} tests and exams with answers`, description: `${s.en} tests and exams for ${lv.name.en} with full answers and marking schemes. Free PDF.` };
}

export function stageSeo(l: Locale, id: StageId) {
  const name = stages[id].name[l];
  const lvls = stages[id].levels.map((x) => levelById(x)!.short[l]).join('، ');
  if (l === 'ar') return { h1: `${name}: فروض واختبارات مع الحلول`, title: `فروض واختبارات ${name} مع الحلول`, description: `فروض واختبارات ${name} مع الحلول المفصلة لكل المستويات (${lvls}) وفق المنهاج الجزائري. تحميل مجاني.` };
  if (l === 'fr') return { h1: `${name} : devoirs et examens corrigés`, title: `Devoirs et examens corrigés — ${name}`, description: `Devoirs et examens corrigés pour tous les niveaux de l’${name.toLowerCase()} en Algérie.` };
  return { h1: `${name}: tests and exams with answers`, title: `${name} tests and exams with answers`, description: `Tests and exams with answers for every ${name.toLowerCase()} level in Algeria.` };
}
