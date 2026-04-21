import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { roomId, password } = req.body;
  if (!roomId || !password) return res.status(400).json({ ok: false, error: '缺少參數' });

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);
    
    const { data: room, error } = await sb.from('rooms').select('password').eq('id', roomId).single();
    
    if (error || !room) {
      return res.status(404).json({ ok: false, error: '找不到聊天室' });
    }

    if (!room.password) {
      return res.status(200).json({ ok: true });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    if (hash === room.password) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(401).json({ ok: false, error: '密碼錯誤' });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: '伺服器錯誤' });
  }
}
