/* ════════════════════════════════════════════════════════
   PROXY DE IA — Cloudflare Worker (plan gratuito)
   Guarda la API key de Anthropic del lado del servidor para
   que la app (GitHub Pages) pueda generar rutinas con IA.

   1. dash.cloudflare.com → Workers & Pages → Create → "Hello World"
   2. Pega este archivo y despliega.
   3. Settings → Variables → agrega el SECRETO  ANTHROPIC_API_KEY
      (y opcional MODEL; por defecto claude-sonnet-5)
   4. Copia la URL del worker en index.html → const AI_ENDPOINT = '...'
   ════════════════════════════════════════════════════════ */
const ORIGENES_PERMITIDOS = [
  'https://TU-USUARIO.github.io',   // ← cambia por el dominio real de la app
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGENES_PERMITIDOS.includes(origin) ? origin : ORIGENES_PERMITIDOS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST' || !ORIGENES_PERMITIDOS.includes(origin)) {
      return new Response('No permitido', { status: 403, headers: cors });
    }

    let body;
    try { body = await request.json(); } catch { return new Response('JSON inválido', { status: 400, headers: cors }); }
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    if (!prompt || prompt.length > 20000) return new Response('Prompt inválido', { status: 400, headers: cors });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.MODEL || 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
