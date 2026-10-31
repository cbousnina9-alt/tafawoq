// ============================================================
//  صندوق المواضيع الواردة (خاص بصاحب الموقع)
//  يتطلب: ربط حاوية R2 باسم INBOX + متغير سري INBOX_KEY (كلمة سر)
//
//  POST /api/inbox  {action:"login", key}      → يضع كوكي الدخول
//  GET  /api/inbox                              → قائمة المواضيع
//  GET  /api/inbox?file=inbox/<id>/<name>       → تحميل ملف
//  POST /api/inbox  {action:"delete", id}       → حذف موضوع بعد معالجته
//  POST /api/inbox  {action:"logout"}
// ============================================================

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const cookieOf = (request) => {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)inbox_auth=([a-f0-9]{64})/);
  return m ? m[1] : '';
};

async function authed(request, env) {
  if (!env.INBOX_KEY) return false;
  const c = cookieOf(request);
  return !!c && c === (await sha('tafawoq-inbox:' + env.INBOX_KEY));
}

export async function onRequestGet({ request, env }) {
  if (!env.INBOX || !env.INBOX_KEY) return json({ error: 'not_configured' }, 503);
  if (!(await authed(request, env))) return json({ error: 'auth' }, 401);

  const url = new URL(request.url);
  const file = url.searchParams.get('file');
  if (file) {
    if (!/^inbox\/[\w-]+\/[\w.\-]+$/.test(file)) return json({ error: 'bad_path' }, 400);
    const obj = await env.INBOX.get(file);
    if (!obj) return json({ error: 'not_found' }, 404);
    const name = file.split('/').pop();
    return new Response(obj.body, {
      headers: {
        'content-type': obj.httpMetadata?.contentType || 'application/octet-stream',
        'content-disposition': `${url.searchParams.get('dl') ? 'attachment' : 'inline'}; filename="${name}"`,
        'cache-control': 'private, no-store',
      },
    });
  }

  // قائمة المواضيع: نقرأ ملفات meta.json
  const items = [];
  let cursor;
  do {
    const list = await env.INBOX.list({ prefix: 'inbox/', cursor, limit: 1000 });
    for (const o of list.objects) {
      if (o.key.endsWith('/meta.json')) items.push(o.key);
    }
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);

  items.sort().reverse();
  const out = [];
  for (const key of items.slice(0, 200)) {
    const obj = await env.INBOX.get(key);
    if (!obj) continue;
    try {
      const meta = await obj.json();
      const dir = key.replace(/meta\.json$/, '');
      const files = (await env.INBOX.list({ prefix: dir })).objects
        .filter((x) => !x.key.endsWith('meta.json'))
        .map((x) => ({ key: x.key, size: x.size }));
      out.push({ ...meta, stored: files });
    } catch {}
  }
  return json({ items: out });
}

export async function onRequestPost({ request, env }) {
  if (!env.INBOX || !env.INBOX_KEY) return json({ error: 'not_configured' }, 503);
  let body = {};
  try {
    body = await request.json();
  } catch {}

  if (body.action === 'login') {
    if (typeof body.key !== 'string' || body.key !== env.INBOX_KEY) {
      await new Promise((r) => setTimeout(r, 800)); // إبطاء محاولات التخمين
      return json({ error: 'wrong_key' }, 401);
    }
    const token = await sha('tafawoq-inbox:' + env.INBOX_KEY);
    return json({ ok: true }, 200, {
      'set-cookie': `inbox_auth=${token}; Path=/api/inbox; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
    });
  }
  if (body.action === 'logout') {
    return json({ ok: true }, 200, { 'set-cookie': 'inbox_auth=; Path=/api/inbox; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
  }

  if (!(await authed(request, env))) return json({ error: 'auth' }, 401);

  if (body.action === 'delete') {
    if (typeof body.id !== 'string' || !/^[\w-]+$/.test(body.id)) return json({ error: 'bad_id' }, 400);
    const list = await env.INBOX.list({ prefix: `inbox/${body.id}/` });
    for (const o of list.objects) await env.INBOX.delete(o.key);
    return json({ ok: true });
  }
  return json({ error: 'bad_action' }, 400);
}
