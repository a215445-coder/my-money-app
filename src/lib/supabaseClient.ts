import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

/** 常见占位符/示例密钥，Supabase 会直接返回 Invalid API key */
export function looksLikePlaceholderSupabaseKey(key: string): boolean {
  const k = key.trim();
  if (/0123456789/i.test(k) && k.includes('secret')) return true;
  if (k === 'your_publishable_anon_key' || k === 'your_real_publishable_or_anon_key') return true;
  if (k.startsWith('sb_publishable_') && k.length < 40) return true;
  return false;
}

if (looksLikePlaceholderSupabaseKey(supabaseAnonKey)) {
  console.warn(
    '[supabase] VITE_SUPABASE_ANON_KEY 看起来像占位符，请在 Supabase 控制台 → Project Settings → API Keys 复制真实 Publishable 或 Legacy anon 密钥'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export { supabaseUrl, supabaseAnonKey };
