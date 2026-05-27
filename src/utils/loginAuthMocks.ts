export type CaptchaSendResult =
  | { success: true }
  | { success: false; message: string };

export type AppleSignInResult =
  | { success: true }
  | { success: false; message: string };

/** 第二阶段对接前：发送验证码占位 */
export async function handleSendCaptcha(phoneE164: string): Promise<CaptchaSendResult> {
  console.log('[login] handleSendCaptcha', { phoneE164 });
  return { success: true };
}

/** 第二阶段对接前：Sign in with Apple 占位 */
export async function handleAppleSignIn(): Promise<AppleSignInResult> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 1000);
  });
  console.log('[login] handleAppleSignIn mock complete');
  return { success: true };
}
