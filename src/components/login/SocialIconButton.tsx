import type { ReactNode } from 'react';

type SocialIconButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

const ICON_BTN_RADIUS = 'rounded-2xl';

export default function SocialIconButton({ label, onClick, children }: SocialIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-zinc-100 bg-white shadow-[0_6px_20px_-10px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.96] ${ICON_BTN_RADIUS}`}
    >
      {children}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function GoogleIconButton(props: Omit<SocialIconButtonProps, 'children'>) {
  return (
    <SocialIconButton {...props}>
      <GoogleGlyph />
    </SocialIconButton>
  );
}
