import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type AuthActionResult =
  | { success: true }
  | { success: false; message: string };

function fail(error: AuthError | null): AuthActionResult {
  return { success: false, message: error?.message ?? 'Authentication failed' };
}

/** 通过 Supabase + Twilio 向手机号发送短信 OTP */
export async function handleSendCaptcha(phoneE164: string): Promise<AuthActionResult> {
  const { error } = await supabase.auth.signInWithOtp({ phone: phoneE164 });
  if (error) return fail(error);
  return { success: true };
}

/** 校验短信验证码并建立会话 */
export async function handleVerifyOtp(
  phoneE164: string,
  token: string
): Promise<AuthActionResult> {
  const { error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: 'sms',
  });
  if (error) return fail(error);
  return { success: true };
}

/** Sign in with Apple（OAuth 重定向 / 系统授权） */
export async function handleAppleSignIn(): Promise<AuthActionResult> {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo,
    },
  });

  if (error) return fail(error);
  return { success: true };
}

export async function signOutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}
