// ============================================================
//  الأطوار، المستويات، المواد وأنواع الملفات
//  وفق المنهاج الجزائري — أضف أو احذف مادة من هنا فقط
// ============================================================
import type { Locale } from './site';

export type T = Record<Locale, string>;

export type StageId = 'ep' | 'em' | 'es';
export type TypeId = 'lesson' | 'summary' | 'exercises' | 'test' | 'exam' | 'mock' | 'official';

export const types: Record<TypeId, { one: T; many: T }> = {
  lesson: { one: { ar: 'درس', fr: 'Cours', en: 'Lesson' }, many: { ar: 'دروس', fr: 'Cours', en: 'Lessons' } },
  summary: { one: { ar: 'ملخص', fr: 'Résumé', en: 'Summary' }, many: { ar: 'ملخصات', fr: 'Résumés', en: 'Summaries' } },
  exercises: { one: { ar: 'سلسلة تمارين', fr: 'Série d’exercices', en: 'Exercise set' }, many: { ar: 'تمارين', fr: 'Exercices', en: 'Exercises' } },
  test: { one: { ar: 'فرض', fr: 'Devoir', en: 'Test' }, many: { ar: 'فروض', fr: 'Devoirs', en: 'Tests' } },
  exam: { one: { ar: 'اختبار', fr: 'Examen', en: 'Exam' }, many: { ar: 'اختبارات', fr: 'Examens', en: 'Exams' } },
  mock: { one: { ar: 'موضوع تجريبي', fr: 'Sujet type', en: 'Mock paper' }, many: { ar: 'مواضيع تجريبية', fr: 'Sujets types', en: 'Mock papers' } },
  official: { one: { ar: 'موضوع رسمي', fr: 'Sujet officiel', en: 'Official paper' }, many: { ar: 'مواضيع رسمية', fr: 'Sujets officiels', en: 'Official papers' } },
};
export const typeIds = Object.keys(types) as TypeId[];

export const trimesters: Record<1 | 2 | 3, T> = {
  1: { ar: 'الفصل الأول', fr: '1er trimestre', en: 'Term 1' },
  2: { ar: 'الفصل الثاني', fr: '2e trimestre', en: 'Term 2' },
  3: { ar: 'الفصل الثالث', fr: '3e trimestre', en: 'Term 3' },
};

export const subjects: Record<string, { name: T }> = {
  arabic: { name: { ar: 'اللغة العربية', fr: 'Langue arabe', en: 'Arabic' } },
  math: { name: { ar: 'الرياضيات', fr: 'Mathématiques', en: 'Mathematics' } },
  french: { name: { ar: 'اللغة الفرنسية', fr: 'Langue française', en: 'French' } },
  english: { name: { ar: 'اللغة الإنجليزية', fr: 'Langue anglaise', en: 'English' } },
  islamic: { name: { ar: 'التربية الإسلامية', fr: 'Éducation islamique', en: 'Islamic education' } },
  civic: { name: { ar: 'التربية المدنية', fr: 'Éducation civique', en: 'Civic education' } },
  scientific: { name: { ar: 'التربية العلمية والتكنولوجية', fr: 'Éducation scientifique et technologique', en: 'Science & technology' } },
  history: { name: { ar: 'التاريخ', fr: 'Histoire', en: 'History' } },
  geography: { name: { ar: 'الجغرافيا', fr: 'Géographie', en: 'Geography' } },
  'history-geo': { name: { ar: 'التاريخ والجغرافيا', fr: 'Histoire-géographie', en: 'History & geography' } },
  science: { name: { ar: 'علوم الطبيعة والحياة', fr: 'Sciences naturelles', en: 'Natural sciences' } },
  physics: { name: { ar: 'العلوم الفيزيائية', fr: 'Sciences physiques', en: 'Physics' } },
  tamazight: { name: { ar: 'اللغة الأمازيغية', fr: 'Tamazight', en: 'Tamazight' } },
  informatics: { name: { ar: 'الإعلام الآلي', fr: 'Informatique', en: 'Computer science' } },
  philosophy: { name: { ar: 'الفلسفة', fr: 'Philosophie', en: 'Philosophy' } },
  economics: { name: { ar: 'الاقتصاد والمناجمنت', fr: 'Économie et management', en: 'Economics & management' } },
  accounting: { name: { ar: 'التسيير المحاسبي والمالي', fr: 'Gestion comptable et financière', en: 'Accounting & finance' } },
  law: { name: { ar: 'القانون', fr: 'Droit', en: 'Law' } },
  engineering: { name: { ar: 'التكنولوجيا (هندسة)', fr: 'Technologie (génie)', en: 'Engineering technology' } },
  german: { name: { ar: 'اللغة الألمانية', fr: 'Allemand', en: 'German' } },
  spanish: { name: { ar: 'اللغة الإسبانية', fr: 'Espagnol', en: 'Spanish' } },
  italian: { name: { ar: 'اللغة الإيطالية', fr: 'Italien', en: 'Italian' } },
};

const P_LOW = ['arabic', 'math', 'islamic', 'civic', 'scientific'];
const P_HIGH = ['arabic', 'math', 'french', 'english', 'islamic', 'civic', 'scientific', 'history', 'geography', 'tamazight'];
const MID = ['arabic', 'math', 'french', 'english', 'islamic', 'civic', 'history-geo', 'science', 'physics', 'tamazight', 'informatics'];
const SEC1 = ['arabic', 'math', 'physics', 'science', 'french', 'english', 'islamic', 'history-geo', 'economics', 'engineering', 'informatics', 'tamazight'];
const SEC2 = ['arabic', 'math', 'physics', 'science', 'french', 'english', 'islamic', 'history-geo', 'economics', 'accounting', 'law', 'engineering', 'philosophy', 'german', 'spanish', 'italian', 'tamazight'];
const SEC3 = SEC2;

export type Level = {
  id: string;
  stage: StageId;
  name: T;
  short: T;
  subjects: string[];
  /** شهادة وطنية (BEM, BAC...) */
  exam?: boolean;
  /** المستوى الذي يحضّر لهذه الشهادة */
  examFor?: string;
};

export const levels: Level[] = [
  { id: '0ap', stage: 'ep', name: { ar: 'القسم التحضيري', fr: 'Préscolaire', en: 'Preschool' }, short: { ar: 'التحضيري', fr: 'Préparatoire', en: 'Preschool' }, subjects: ['arabic', 'math', 'islamic', 'scientific'] },
  { id: '1ap', stage: 'ep', name: { ar: 'السنة الأولى ابتدائي', fr: '1ère année primaire', en: '1st year primary' }, short: { ar: '1 ابتدائي', fr: '1AP', en: '1AP' }, subjects: P_LOW },
  { id: '2ap', stage: 'ep', name: { ar: 'السنة الثانية ابتدائي', fr: '2e année primaire', en: '2nd year primary' }, short: { ar: '2 ابتدائي', fr: '2AP', en: '2AP' }, subjects: P_LOW },
  { id: '3ap', stage: 'ep', name: { ar: 'السنة الثالثة ابتدائي', fr: '3e année primaire', en: '3rd year primary' }, short: { ar: '3 ابتدائي', fr: '3AP', en: '3AP' }, subjects: P_HIGH },
  { id: '4ap', stage: 'ep', name: { ar: 'السنة الرابعة ابتدائي', fr: '4e année primaire', en: '4th year primary' }, short: { ar: '4 ابتدائي', fr: '4AP', en: '4AP' }, subjects: P_HIGH },
  { id: '5ap', stage: 'ep', name: { ar: 'السنة الخامسة ابتدائي', fr: '5e année primaire', en: '5th year primary' }, short: { ar: '5 ابتدائي', fr: '5AP', en: '5AP' }, subjects: P_HIGH },
  { id: '1am', stage: 'em', name: { ar: 'السنة الأولى متوسط', fr: '1ère année moyenne', en: '1st year middle' }, short: { ar: '1 متوسط', fr: '1AM', en: '1AM' }, subjects: MID },
  { id: '2am', stage: 'em', name: { ar: 'السنة الثانية متوسط', fr: '2e année moyenne', en: '2nd year middle' }, short: { ar: '2 متوسط', fr: '2AM', en: '2AM' }, subjects: MID },
  { id: '3am', stage: 'em', name: { ar: 'السنة الثالثة متوسط', fr: '3e année moyenne', en: '3rd year middle' }, short: { ar: '3 متوسط', fr: '3AM', en: '3AM' }, subjects: MID },
  { id: '4am', stage: 'em', name: { ar: 'السنة الرابعة متوسط', fr: '4e année moyenne', en: '4th year middle' }, short: { ar: '4 متوسط', fr: '4AM', en: '4AM' }, subjects: MID, examFor: 'bem' },
  { id: 'bem', stage: 'em', exam: true, name: { ar: 'شهادة التعليم المتوسط', fr: 'BEM', en: 'BEM (middle school certificate)' }, short: { ar: 'BEM', fr: 'BEM', en: 'BEM' }, subjects: MID.filter((s) => s !== 'informatics') },
  { id: '1as', stage: 'es', name: { ar: 'السنة الأولى ثانوي', fr: '1ère année secondaire', en: '1st year secondary' }, short: { ar: '1 ثانوي', fr: '1AS', en: '1AS' }, subjects: SEC1 },
  { id: '2as', stage: 'es', name: { ar: 'السنة الثانية ثانوي', fr: '2e année secondaire', en: '2nd year secondary' }, short: { ar: '2 ثانوي', fr: '2AS', en: '2AS' }, subjects: SEC2 },
  { id: '3as', stage: 'es', name: { ar: 'السنة الثالثة ثانوي', fr: '3e année secondaire', en: '3rd year secondary' }, short: { ar: '3 ثانوي', fr: '3AS', en: '3AS' }, subjects: SEC3, examFor: 'bac' },
  { id: 'bac', stage: 'es', exam: true, name: { ar: 'شهادة البكالوريا', fr: 'Baccalauréat', en: 'Baccalaureate (BAC)' }, short: { ar: 'BAC', fr: 'BAC', en: 'BAC' }, subjects: SEC3 },
];

export const stages: Record<StageId, { name: T; levels: string[] }> = {
  ep: { name: { ar: 'التعليم الابتدائي', fr: 'Enseignement primaire', en: 'Primary school' }, levels: levels.filter((l) => l.stage === 'ep').map((l) => l.id) },
  em: { name: { ar: 'التعليم المتوسط', fr: 'Enseignement moyen', en: 'Middle school' }, levels: levels.filter((l) => l.stage === 'em').map((l) => l.id) },
  es: { name: { ar: 'التعليم الثانوي', fr: 'Enseignement secondaire', en: 'Secondary school' }, levels: levels.filter((l) => l.stage === 'es').map((l) => l.id) },
};
export const stageIds = Object.keys(stages) as StageId[];

export const levelById = (id: string) => levels.find((l) => l.id === id);

// أقسام المنوعات (مقالات)
export const categories: Record<string, { name: T; desc: T }> = {
  advice: { name: { ar: 'نصائح وتوجيهات', fr: 'Conseils', en: 'Study tips' }, desc: { ar: 'طرق المراجعة وتنظيم الوقت والتحضير للامتحانات.', fr: 'Méthodes de révision et préparation aux examens.', en: 'Revision methods and exam preparation.' } },
  news: { name: { ar: 'أخبار التربية', fr: 'Actualités', en: 'Education news' }, desc: { ar: 'مستجدات القطاع، الرزنامة والإعلانات المهمة للتلاميذ والأولياء.', fr: 'Actualités du secteur éducatif.', en: 'News from the education sector.' } },
  teachers: { name: { ar: 'وثائق الأساتذة', fr: 'Espace enseignants', en: 'For teachers' }, desc: { ar: 'مذكرات، تدرجات ووثائق تربوية للأساتذة.', fr: 'Fiches et documents pédagogiques.', en: 'Lesson plans and teaching documents.' } },
  stories: { name: { ar: 'قصص وحكايات', fr: 'Contes et histoires', en: 'Stories' }, desc: { ar: 'قصص هادفة للأطفال تنمي القراءة والخيال.', fr: 'Histoires pour enfants.', en: 'Stories for children.' } },
  enigmes: { name: { ar: 'ألغاز وفوازير', fr: 'Énigmes', en: 'Riddles' }, desc: { ar: 'ألغاز مع الحل لتنشيط الذهن.', fr: 'Énigmes avec solutions.', en: 'Riddles with answers.' } },
  islam: { name: { ar: 'الركن الإسلامي', fr: 'Coin islamique', en: 'Islamic corner' }, desc: { ar: 'أدعية، سيرة ومواضيع تربوية.', fr: 'Invocations et sujets éducatifs.', en: 'Supplications and educational topics.' } },
};
export const categoryIds = Object.keys(categories);
