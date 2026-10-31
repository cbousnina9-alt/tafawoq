'use client';

import { useEffect, useRef, useState } from 'react';
import { levels, subjects } from '@/lib/catalog';
import type { Locale } from '@/lib/site';

type Status = 'idle' | 'sending' | 'done' | 'error';

const ERR: Record<string, [string, string, string]> = {
  no_file: ['أرفق صورة أو ملف PDF للموضوع، أو ضع رابطًا له.', 'Ajoute une photo, un PDF ou un lien.', 'Attach a photo, a PDF or a link.'],
  too_many: ['الحد الأقصى 6 ملفات في الإرسال الواحد.', '6 fichiers maximum.', '6 files maximum.'],
  too_big: ['حجم الملفات كبير: 10 ميغا للملف و25 ميغا للمجموع على الأكثر.', 'Fichiers trop lourds (10 Mo/fichier, 25 Mo au total).', 'Files too large (10 MB each, 25 MB total).'],
  bad_type: ['نقبل الصور (JPG, PNG) وملفات PDF فقط.', 'Seules les images et les PDF sont acceptés.', 'Only images and PDFs are accepted.'],
  consent: ['أكّد أن لك الحق في مشاركة الموضوع.', 'Confirme que tu as le droit de partager ce sujet.', 'Confirm you may share this paper.'],
  too_fast: ['تمهّل قليلًا ثم أعد الإرسال.', 'Patiente un peu puis réessaie.', 'Please wait a moment and retry.'],
  not_configured: ['الاستقبال غير مفعّل حاليًا. أرسل الموضوع عبر صفحة «اتصل بنا».', 'Envoi indisponible. Utilise la page Contact.', 'Uploads are unavailable. Please use the contact page.'],
};

const TYPES = [
  ['test', 'فرض', 'Devoir', 'Test'],
  ['exam', 'اختبار', 'Examen', 'Exam'],
  ['exercises', 'سلسلة تمارين', 'Exercices', 'Exercises'],
  ['lesson', 'درس أو ملخص', 'Cours / résumé', 'Lesson / summary'],
  ['official', 'موضوع رسمي (BEM / BAC)', 'Sujet officiel', 'Official paper'],
] as const;

const fmt = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function UploadForm({ locale, contactHref }: { locale: Locale; contactHref: string }) {
  const L = (ar: string, fr: string, en: string) => (locale === 'ar' ? ar : locale === 'fr' ? fr : en);
  const [level, setLevel] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState<boolean | null>(null);
  const t0 = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    t0.current = Date.now();
    fetch('/api/submit').then((r) => r.json()).then((d) => setReady(!!d.ready)).catch(() => setReady(false));
  }, []);

  const lv = levels.find((x) => x.id === level);
  const subjectIds = lv ? lv.subjects : Object.keys(subjects);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 6);
    setFiles(next);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    fd.delete('files');
    files.forEach((f) => fd.append('files', f, f.name));
    fd.set('t0', String(t0.current));
    if (!files.length && !String(fd.get('link') || '').startsWith('http')) {
      setError(ERR.no_file[locale === 'ar' ? 0 : locale === 'fr' ? 1 : 2]);
      return;
    }
    setStatus('sending');
    try {
      const r = await fetch('/api/submit', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setStatus('done');
        setFiles([]);
        formRef.current?.reset();
        setLevel('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const m = ERR[d.error as string];
        setError(m ? m[locale === 'ar' ? 0 : locale === 'fr' ? 1 : 2] : L('تعذّر الإرسال، حاول مرة أخرى بعد قليل.', 'Échec de l’envoi, réessaie.', 'Sending failed, please retry.'));
        setStatus('error');
      }
    } catch {
      setError(L('تعذّر الاتصال، تحقّق من الإنترنت وأعد المحاولة.', 'Connexion impossible, réessaie.', 'Connection failed, please retry.'));
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="up-done" role="status">
        <span className="up-done-ic" aria-hidden>✓</span>
        <h2>{L('وصلنا موضوعك، شكرًا لك!', 'Sujet reçu, merci !', 'Paper received, thank you!')}</h2>
        <p>{L('سنراجعه ونكتبه في ورقة نظيفة مع الحل إن وُجد، ثم ننشره خلال أيام في صفحة المادة.', 'Nous le vérifions et le publions sous quelques jours.', 'We will review it and publish it within a few days.')}</p>
        <button className="btn btn-primary" type="button" onClick={() => { setStatus('idle'); t0.current = Date.now(); }}>
          {L('أرسل موضوعًا آخر', 'Envoyer un autre sujet', 'Send another paper')}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form up-form" onSubmit={onSubmit} noValidate={false}>
      {ready === false && (
        <p className="up-warn">
          {L('الإرسال من الموقع غير متاح مؤقتًا. يمكنك إرسال الموضوع عبر ', 'L’envoi est momentanément indisponible. Utilise la ', 'Uploading is temporarily unavailable. Please use the ')}
          <a href={contactHref}>{L('صفحة اتصل بنا', 'page Contact', 'contact page')}</a>.
        </p>
      )}

      <fieldset className="up-group">
        <legend>{L('1. عن الموضوع', '1. Le sujet', '1. The paper')}</legend>
        <div className="up-grid">
          <label>{L('النوع', 'Type', 'Type')}
            <select name="type" required defaultValue="">
              <option value="" disabled>—</option>
              {TYPES.map(([id, ar, fr, en]) => <option key={id} value={id}>{L(ar, fr, en)}</option>)}
            </select>
          </label>
          <label>{L('المستوى', 'Niveau', 'Level')}
            <select name="level" required value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="" disabled>—</option>
              {levels.map((x) => <option key={x.id} value={x.id}>{x.name[locale]}</option>)}
            </select>
          </label>
          <label>{L('المادة', 'Matière', 'Subject')}
            <select name="subject" required defaultValue="" key={level}>
              <option value="" disabled>—</option>
              {subjectIds.map((id) => <option key={id} value={id}>{subjects[id].name[locale]}</option>)}
            </select>
          </label>
          <label>{L('الفصل', 'Trimestre', 'Term')}
            <select name="term" defaultValue="1">
              <option value="1">{L('الفصل الأول', '1er trimestre', 'Term 1')}</option>
              <option value="2">{L('الفصل الثاني', '2e trimestre', 'Term 2')}</option>
              <option value="3">{L('الفصل الثالث', '3e trimestre', 'Term 3')}</option>
            </select>
          </label>
          <label>{L('السنة الدراسية', 'Année scolaire', 'School year')}
            <input name="year" defaultValue="2026/2027" dir="ltr" maxLength={20} />
          </label>
          <label>{L('الولاية', 'Wilaya', 'Province')}
            <input name="wilaya" maxLength={60} placeholder={L('مثال: سطيف', 'ex. Sétif', 'e.g. Setif')} />
          </label>
        </div>
        <label>{L('المؤسسة (اختياري)', 'Établissement (facultatif)', 'School (optional)')}
          <input name="school" maxLength={120} placeholder={L('مثال: متوسطة ابن خلدون', 'ex. CEM Ibn Khaldoun', 'e.g. Ibn Khaldoun middle school')} />
        </label>
        <label className="up-check"><input type="checkbox" name="solution" /> {L('الموضوع معه الحل أو التصحيح', 'Le corrigé est inclus', 'Answer key included')}</label>
      </fieldset>

      <fieldset className="up-group">
        <legend>{L('2. الملفات', '2. Les fichiers', '2. Files')}</legend>
        <div
          className="up-drop"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('over'); }}
          onDragLeave={(e) => e.currentTarget.classList.remove('over')}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('over'); addFiles(e.dataTransfer.files); }}
        >
          <input ref={fileRef} id="up-files" type="file" name="files" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic" multiple onChange={(e) => addFiles(e.target.files)} />
          <label htmlFor="up-files" className="up-drop-in">
            <span className="up-drop-ic" aria-hidden>📄</span>
            <b>{L('صوّر الورقة أو اختر ملف PDF', 'Prends une photo ou choisis un PDF', 'Take a photo or choose a PDF')}</b>
            <span>{L('حتى 6 ملفات — صورة واضحة لكل صفحة', 'Jusqu’à 6 fichiers — une photo nette par page', 'Up to 6 files — one clear photo per page')}</span>
          </label>
        </div>
        {files.length > 0 && (
          <ul className="up-files">
            {files.map((f, i) => (
              <li key={i}>
                <span className="up-fname">{f.name}</span>
                <span className="up-fsize">{fmt(f.size)}</span>
                <button type="button" aria-label={L('حذف', 'Retirer', 'Remove')} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
              </li>
            ))}
          </ul>
        )}
        <label>{L('أو رابط الملف (Google Drive، تيليغرام…)', 'ou lien du fichier (Drive…)', 'or file link (Drive…)')}
          <input name="link" type="url" dir="ltr" maxLength={400} placeholder="https://" />
        </label>
      </fieldset>

      <fieldset className="up-group">
        <legend>{L('3. عنك (اختياري)', '3. Toi (facultatif)', '3. About you (optional)')}</legend>
        <div className="up-grid">
          <label>{L('الاسم', 'Nom', 'Name')}
            <input name="name" maxLength={80} autoComplete="name" />
          </label>
          <label>{L('البريد الإلكتروني', 'E-mail', 'Email')}
            <input name="email" type="email" maxLength={120} dir="ltr" autoComplete="email" />
          </label>
        </div>
        <label className="up-check"><input type="checkbox" name="credit" /> {L('أريد ذكر اسمي مع الموضوع (شكرًا لـ…)', 'Citer mon nom avec le sujet', 'Credit my name with the paper')}</label>
        <label>{L('ملاحظة', 'Remarque', 'Note')}
          <textarea name="message" rows={3} maxLength={1000} placeholder={L('مثال: هذا اختبار الفصل الأول جاء في متوسطتنا يوم 3 ديسمبر', '', '')} />
        </label>
      </fieldset>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="up-hp" aria-hidden />
      <label className="up-check up-consent"><input type="checkbox" name="consent" required /> {L('أؤكد أن هذا موضوع حقيقي من مؤسسة تعليمية أو من إعدادي، وأوافق على نشره مجانًا في الموقع.', 'Je confirme que ce sujet est authentique et j’accepte sa publication gratuite.', 'I confirm this paper is genuine and agree to its free publication.')}</label>

      {error && <p className="up-err" role="alert">{error}</p>}
      <button className="btn btn-primary up-send" type="submit" disabled={status === 'sending' || ready === false}>
        {status === 'sending' ? L('جارٍ الإرسال…', 'Envoi…', 'Sending…') : L('أرسل الموضوع', 'Envoyer le sujet', 'Send the paper')}
      </button>
      <p className="up-fine">{L('لا ننشر بريدك الإلكتروني أبدًا. نراجع كل موضوع ونكتبه بخط واضح قبل نشره.', 'Ton e-mail ne sera jamais publié.', 'Your email is never published.')}</p>
    </form>
  );
}
