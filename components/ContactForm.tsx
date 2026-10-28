import { levels, subjects } from '@/lib/catalog';
import { site, type Locale } from '@/lib/site';

// ضع رابط خدمة النماذج (مثلًا Formspree أو Web3Forms) في NEXT_PUBLIC_FORM_ENDPOINT
// وإلا يُفتح تطبيق البريد مباشرة.
const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || '';

const L = {
  ar: { name: 'الاسم', email: 'البريد الإلكتروني', subject: 'الموضوع', message: 'الرسالة', send: 'إرسال الرسالة', level: 'المستوى', sub: 'المادة', file: 'الملف (PDF)', credit: 'أريد ذكر اسمي مع الملف', sendFile: 'إرسال الملف', link: 'أو رابط الملف (Google Drive...)' },
  fr: { name: 'Nom', email: 'E-mail', subject: 'Objet', message: 'Message', send: 'Envoyer le message', level: 'Niveau', sub: 'Matière', file: 'Fichier (PDF)', credit: 'Citer mon nom avec le fichier', sendFile: 'Envoyer le fichier', link: 'ou lien du fichier (Google Drive…)' },
  en: { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message', send: 'Send message', level: 'Level', sub: 'Subject', file: 'File (PDF)', credit: 'Credit my name with the file', sendFile: 'Send file', link: 'or file link (Google Drive…)' },
};

export default function ContactForm({ locale, upload }: { locale: Locale; upload?: boolean }) {
  const l = L[locale];
  const action = endpoint || `mailto:${site.contactEmail}`;
  const extra = endpoint ? { encType: upload ? 'multipart/form-data' : undefined } : { encType: 'text/plain' };
  return (
    <form className="form" action={action} method="post" {...extra}>
      <label>{l.name}<input name="name" required autoComplete="name" /></label>
      <label>{l.email}<input name="email" type="email" required autoComplete="email" dir="ltr" /></label>
      {upload ? (
        <>
          <label>{l.level}
            <select name="level" required defaultValue="">
              <option value="" disabled>—</option>
              {levels.map((lv) => <option key={lv.id} value={lv.id}>{lv.name[locale]}</option>)}
            </select>
          </label>
          <label>{l.sub}
            <select name="subject" required defaultValue="">
              <option value="" disabled>—</option>
              {Object.entries(subjects).map(([id, s]) => <option key={id} value={id}>{s.name[locale]}</option>)}
            </select>
          </label>
          {endpoint && <label>{l.file}<input name="file" type="file" accept="application/pdf,image/*" /></label>}
          <label>{l.link}<input name="link" type="url" dir="ltr" /></label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }}><input type="checkbox" name="credit" /> {l.credit}</label>
          <label>{l.message}<textarea name="message" rows={3} /></label>
          <button className="btn btn-primary" type="submit">{l.sendFile}</button>
        </>
      ) : (
        <>
          <label>{l.subject}<input name="subject" required /></label>
          <label>{l.message}<textarea name="message" rows={6} required /></label>
          <button className="btn btn-primary" type="submit">{l.send}</button>
        </>
      )}
    </form>
  );
}
