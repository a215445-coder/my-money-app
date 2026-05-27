import type { AuthError } from '@supabase/supabase-js';
import { looksLikePlaceholderSupabaseKey, supabase } from '../lib/supabaseClient';
import { isValidE164Phone } from '../components/phoneCountries';

export type AuthActionResult =
  | { success: true }
  | { success: false; message: string };

function fail(error: AuthError | null, fallback = 'Authentication failed'): AuthActionResult {
  return { success: false, message: mapAuthErrorMessage(error, fallback) };
}

function mapAuthErrorMessage(error: AuthError | null, fallback: string): string {
  if (!error) return fallback;
  const msg = error.message.toLowerCase();
  const status = error.status ?? 0;

  if (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load failed') ||
    status === 0
  ) {
    return '无法连接 Supabase，请检查网络与 VITE_SUPABASE_URL，并重启 npm run dev';
  }
  if (msg.includes('invalid api key') || msg.includes('unregistered api key')) {
    return [
      'Supabase 公钥无效（服务器已拒绝当前密钥）。',
      '请打开 supabase.com/dashboard → 本项目 → Project Settings → API Keys，',
      '复制 Publishable key（sb_publishable_…）或 Legacy 里的 anon public（eyJ 开头），',
      '完整粘贴到 .env 的 VITE_SUPABASE_ANON_KEY，保存后重启 npm run dev。',
      '注意：不能使用文档示例或编造密钥，必须从你自己的项目控制台复制。',
    ].join('');
  }
  if (msg.includes('phone provider') || msg.includes('sms provider') || msg.includes('twilio')) {
    return '短信通道未就绪：请在 Supabase 控制台 Authentication → Phone 中配置 Twilio';
  }
  if (msg.includes('rate limit') || status === 429) {
    return '发送过于频繁，请稍后再试';
  }
  if (msg.includes('invalid phone') || msg.includes('phone number')) {
    return '手机号格式无效，请确认区号与号码正确（例如 +86138xxxxxxxx）';
  }
  return error.message;
}

/** 通过 Supabase + Twilio 向手机号发送短信 OTP */
export async function handleSendCaptcha(phoneE164: string): Promise<AuthActionResult> {
  if (!isValidE164Phone(phoneE164)) {
    return {
      success: false,
      message: `手机号须为国际格式 E.164，当前：${phoneE164 || '（空）'}`,
    };
  }

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
  if (looksLikePlaceholderSupabaseKey(anonKey)) {
    return {
      success: false,
      message:
        '当前 .env 中的 VITE_SUPABASE_ANON_KEY 仍是占位/无效密钥。请从 Supabase 控制台 API Keys 页完整复制 Publishable 或 anon 公钥后再试。',
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneE164,
    options: { channel: 'sms' },
  });

  if (error) {
    console.error('[login] signInWithOtp failed', { phoneE164, error });
    return fail(error);
  }

  console.info('[login] signInWithOtp accepted', { phoneE164, data });
  return { success: true };
}

/** 校验短信验证码并建立会话 */
export async function handleVerifyOtp(
  phoneE164: string,
  token: string
): Promise<AuthActionResult> {
  if (!isValidE164Phone(phoneE164)) {
    return { success: false, message: '手机号格式无效' };
  }

  const { error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: 'sms',
  });
  if (error) {
    console.error('[login] verifyOtp failed', { phoneE164, error });
    return fail(error);
  }
  return { success: true };
}

/** Sign in with Apple（OAuth 重定向 / 系统授权） */
export async function handleAppleSignIn(): Promise<AuthActionResult> {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo },
  });

  if (error) return fail(error);
  return { success: true };
}

export async function signOutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}
