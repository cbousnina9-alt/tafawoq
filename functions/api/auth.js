// بداية تسجيل الدخول إلى لوحة التحكم عبر GitHub (بديل Netlify OAuth)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const auth = new URL('https://github.com/login/oauth/authorize');
  auth.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  auth.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  auth.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  auth.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      'Set-Cookie': `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
