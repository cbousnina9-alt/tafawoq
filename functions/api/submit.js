// ============================================================
//  استقبال المواضيع التي يرسلها الأساتذة والتلاميذ
//  POST /api/submit  (multipart/form-data)
//
//  الوجهة (واحدة على الأقل، تُضبط في Cloudflare Pages → Settings):
//   • تيليغرام:  TG_BOT_TOKEN + TG_CHAT_ID  (متغيرات بيئة مشفّرة)
//     تصلك الملفات مباشرة في محادثة البوت.
//   • R2 (اختياري): ربط حاوية باسم INBOX  (Bindings → R2 bucket)
//     تُحفظ الملفات في inbox/<id>/...
// ============================================================

const MAX_FILES = 6;
const MAX_FILE = 10 * 1024 * 1024; // 10MB للملف
const MAX_TOTAL = 25 * 1024 * 1024; // 25MB للمجموع
const OK_TYPES = /^(application\/pdf|image\/(jpeg|png|webp|heic|heif))$/;
const MIN_SECONDS = 4; // أقل مدة معقولة لملء النموذج (حماية من الروبوتات)

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const hasTg = env.TG_BOT_TOKEN && env.TG_CHAT_ID;
  const hasR2 = !!env.INBOX;
  if (!hasTg && !hasR2) return json({ ok: false, error: 'not_configured' }, 503);

  let fd;
  try {
    fd = await request.formData();
  } catch {
    return json({ ok: false, error: 'bad_form' }, 400);
  }

  // مصيدة الروبوتات: حقل مخفي يجب أن يبقى فارغًا + مدة ملء دنيا
  if (clean(fd.get('website'))) return json({ ok: true });
  const started = Number(fd.get('t0') || 0);
  if (started && Date.now() - started < MIN_SECONDS * 1000) return json({ ok: false, error: 'too_fast' }, 429);

  const f = {
    type: clean(fd.get('type'), 30),
    level: clean(fd.get('level'), 10),
    subject: clean(fd.get('subject'), 30),
    term: clean(fd.get('term'), 5),
    year: clean(fd.get('year'), 20),
    school: clean(fd.get('school'), 120),
    wilaya: clean(fd.get('wilaya'), 60),
    solution: fd.get('solution') ? 'نعم' : 'لا',
    name: clean(fd.get('name'), 80),
    credit: fd.get('credit') ? 'نعم' : 'لا',
    email: clean(fd.get('email'), 120),
    link: clean(fd.get('link'), 400),
    note: clean(fd.get('message'), 1000),
  };
  if (!f.level || !f.subject) return json({ ok: false, error: 'missing_fields' }, 400);
  if (!fd.get('consent')) return json({ ok: false, error: 'consent' }, 400);

  const files = fd.getAll('files').filter((x) => x && typeof x === 'object' && x.size > 0);
  if (!files.length && !/^https?:\/\//.test(f.link)) return json({ ok: false, error: 'no_file' }, 400);
  if (files.length > MAX_FILES) return json({ ok: false, error: 'too_many' }, 400);
  let total = 0;
  for (const file of files) {
    if (!OK_TYPES.test(file.type)) return json({ ok: false, error: 'bad_type' }, 400);
    if (file.size > MAX_FILE) return json({ ok: false, error: 'too_big' }, 400);
    total += file.size;
  }
  if (total > MAX_TOTAL) return json({ ok: false, error: 'too_big' }, 400);

  const id = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '-' + crypto.randomUUID().slice(0, 6);
  const meta = { id, received: new Date().toISOString(), ...f, files: files.map((x) => ({ name: x.name, type: x.type, size: x.size })) };

  const caption = [
    `📥 موضوع جديد — ${id}`,
    `النوع: ${f.type || '—'} | المستوى: ${f.level} | المادة: ${f.subject}`,
    `الفصل: ${f.term || '—'} | السنة: ${f.year || '—'} | مع الحل: ${f.solution}`,
    `المؤسسة: ${f.school || '—'} | الولاية: ${f.wilaya || '—'}`,
    `المرسل: ${f.name || '—'} (ذكر الاسم: ${f.credit})${f.email ? ' | ' + f.email : ''}`,
    f.link ? `الرابط: ${f.link}` : '',
    f.note ? `ملاحظة: ${f.note}` : '',
    `الملفات: ${files.length}`,
  ].filter(Boolean).join('\n');

  try {
    if (hasR2) {
      for (const [i, file] of files.entries()) {
        const safe = (file.name || `file-${i + 1}`).replace(/[^\w.\-]+/g, '_').slice(-80);
        await env.INBOX.put(`inbox/${id}/${i + 1}-${safe}`, file.stream(), { httpMetadata: { contentType: file.type } });
      }
      await env.INBOX.put(`inbox/${id}/meta.json`, JSON.stringify(meta, null, 2), { httpMetadata: { contentType: 'application/json' } });
    }
    if (hasTg) {
      const api = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}`;
      const msg = await fetch(`${api}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text: caption.slice(0, 4000), disable_web_page_preview: true }),
      });
      if (!msg.ok && !hasR2) throw new Error('tg_message');
      for (const file of files) {
        const body = new FormData();
        body.append('chat_id', env.TG_CHAT_ID);
        body.append('document', file, file.name || 'file');
        body.append('caption', `${id} — ${f.level}/${f.subject}`);
        const r = await fetch(`${api}/sendDocument`, { method: 'POST', body });
        if (!r.ok && !hasR2) throw new Error('tg_document');
      }
    }
  } catch (e) {
    return json({ ok: false, error: 'delivery' }, 502);
  }

  return json({ ok: true, id });
}

export async function onRequestGet({ env }) {
  // يسمح للواجهة بمعرفة هل الاستقبال مفعّل
  const ready = !!((env.TG_BOT_TOKEN && env.TG_CHAT_ID) || env.INBOX);
  return json({ ready });
}
