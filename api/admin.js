import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { action, password, roomId, clearType } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: '密碼錯誤' });
  }

  if (action === 'verify') {
    return res.status(200).json({ ok: true });
  }

  if (action === 'clear') {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);
    let query = sb.from('messages').delete();

    if (roomId && roomId !== 'all') {
      query = query.eq('room_id', roomId);
    }

    if (clearType === 'old') {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.lt('created_at', cutoff);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await query.select();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, count: data ? data.length : 0 });
  }

  return res.status(400).json({ ok: false, error: '未知操作' });
}
