import { Loader2 } from 'lucide-react';
import AppleLogo from './AppleLogo';

const LOGIN_BTN_RADIUS = 'rounded-2xl';

type AppleSignInButtonProps = {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/** Sign in with Apple — 符合 Apple HIG 的黑底白字主按钮 */
export default function AppleSignInButton({
  label,
  loadingLabel,
  loading,
  disabled = false,
  onClick,
}: AppleSignInButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      className={`flex w-full items-center justify-center gap-2.5 ${LOGIN_BTN_RADIUS} bg-[#000000] py-4 text-[15px] font-semibold text-white shadow-[0_12px_32px_-10px_rgba(0,0,0,0.5)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="shrink-0 animate-spin" aria-hidden />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <AppleLogo className="h-[18px] w-[18px] shrink-0 text-white" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
