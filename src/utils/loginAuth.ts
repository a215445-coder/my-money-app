import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { isValidE164Phone } from '../components/phoneCountries';

export type AuthActionResult =
  | { success: true }
  | { success: false; message: string };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';

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
    return '无法连接 Supabase 认证服务，请检查 .env 中的 VITE_SUPABASE_URL 是否与控制台完全一致，并重启 npm run dev';
  }
  if (msg.includes('invalid api key') || msg.includes('unregistered api key')) {
    return 'Supabase 公钥无效。请打开控制台 → Project Settings → API Keys，复制 Publishable key（sb_publishable_…）或 Legacy anon key（eyJ…）到 .env 的 VITE_SUPABASE_ANON_KEY，保存后重启 npm run dev';
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

/** 仅检测网络/DNS；Supabase /auth/v1/health 常返回 401，不能当作不可用 */
async function assertSupabaseReachable(): Promise<AuthActionResult | null> {
  if (!supabaseUrl) {
    return { success: false, message: '未配置 VITE_SUPABASE_URL' };
  }
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET' });
    if (res.status === 404) {
      return {
        success: false,
        message: 'Supabase 项目 URL 不存在（404），请核对 VITE_SUPABASE_URL',
      };
    }
    return null;
  } catch {
    return {
      success: false,
      message:
        'Supabase 项目地址无法访问（DNS/URL 错误）。请打开控制台 → Project Settings → API，复制 Project URL 到 .env 后重启 npm run dev',
    };
  }
}

/** 通过 Supabase + Twilio 向手机号发送短信 OTP */
export async function handleSendCaptcha(phoneE164: string): Promise<AuthActionResult> {
  if (!isValidE164Phone(phoneE164)) {
    return {
      success: false,
      message: `手机号须为国际格式 E.164，当前：${phoneE164 || '（空）'}`,
    };
  }

  const reachability = await assertSupabaseReachable();
  if (reachability) {
    console.error('[login] Supabase unreachable', { supabaseUrl });
    return reachability;
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
