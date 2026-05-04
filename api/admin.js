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

    if (clearType === 'delete_room') {
      if (!roomId || roomId === 'all') {
        return res.status(400).json({ ok: false, error: '必須指定一個聊天室才能刪除' });
      }
      // 先刪除該房間下的所有訊息
      await sb.from('messages').delete().eq('room_id', roomId);
      // 再刪除房間本身
      const { data, error } = await sb.from('rooms').delete().eq('id', roomId).select();
      if (error) return res.status(500).json({ ok: false, error: error.message });
      if (!data || data.length === 0) {
        return res.status(403).json({ ok: false, error: '權限不足或找不到房間（請確認 Vercel 有設定 SUPABASE_SERVICE_KEY）' });
      }
      return res.status(200).json({ ok: true, count: 0, deletedRoom: true });
    }

    let query = sb.from('messages').delete();

    if (roomId && roomId !== 'all') {
      query = query.eq('room_id', roomId);
    }

    if (clearType === 'old') {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.lt('created_at', cutoff);
    } else if (clearType === '3days') {
      const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      query = query.lt('created_at', cutoff);
    } else {
      query = query.not('id', 'is', null);
    }

    const { data, error } = await query.select();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, count: data ? data.length : 0 });
  }

  return res.status(400).json({ ok: false, error: '未知操作' });
}
