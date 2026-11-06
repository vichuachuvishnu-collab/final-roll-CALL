const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PIN = process.env.ADMIN_PIN || '';

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}
async function db(method, body) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.');
  const url = `${SUPABASE_URL}/rest/v1/rollcall?select=*${method === 'POST' ? '&on_conflict=id' : '&id=eq.1'}`;
  const r = await fetch(url, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'resolution=merge-duplicates,return=representation' : 'return=representation'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const raw = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${raw}`);
  return raw ? JSON.parse(raw) : [];
}
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rows = await db('GET');
      const r = rows[0];
      if (!r) return reply(res, 200, {order:'',orderHtml:'',flashMessage:'IMPORTANT ANNOUNCEMENT',announcement:'IMPORTANT ANNOUNCEMENT',publishedAt:'',revision:0});
      return reply(res, 200, {
        order:r.order_text || '',
        orderHtml:r.order_html || '',
        flashMessage:r.flash_message || 'IMPORTANT ANNOUNCEMENT',
        announcement:r.flash_message || 'IMPORTANT ANNOUNCEMENT',
        publishedAt:r.published_at || '',
        revision:r.revision || 0
      });
    } catch (e) { return reply(res, 503, {ok:false,error:e.message}); }
  }
  if (req.method === 'POST') {
    if (!ADMIN_PIN || req.headers['x-admin-pin'] !== ADMIN_PIN) return reply(res, 401, {ok:false,error:'Incorrect or missing Admin PIN. Set ADMIN_PIN in Vercel and enter the same PIN on the page.'});
    try {
      const b = req.body || {};
      const record = {
        id:1,
        order_text:typeof b.order === 'string' ? b.order : '',
        order_html:typeof b.orderHtml === 'string' ? b.orderHtml : '',
        flash_message:typeof b.flashMessage === 'string' ? b.flashMessage : (b.announcement || 'IMPORTANT ANNOUNCEMENT'),
        published_at:new Date().toISOString(),
        revision:Date.now()
      };
      const rows = await db('POST', record);
      const r = rows[0] || record;
      return reply(res, 200, {ok:true,order:r.order_text,orderHtml:r.order_html,flashMessage:r.flash_message,announcement:r.flash_message,publishedAt:r.published_at,revision:r.revision});
    } catch (e) { return reply(res, 503, {ok:false,error:e.message}); }
  }
  res.setHeader('Allow','GET, POST');
  return reply(res,405,{ok:false,error:'Method not allowed'});
};
