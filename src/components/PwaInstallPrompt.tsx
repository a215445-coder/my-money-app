import { useEffect, useMemo, useState } from 'react';
import { Share2, Download } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)')?.matches === true || nav.standalone === true;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isWebKit = /applewebkit/i.test(ua);
  const isChrome = /crios|chrome|crmo/i.test(ua);
  const isFirefox = /fxios/i.test(ua);
  return isWebKit && !isChrome && !isFirefox;
}

export default function PwaInstallPrompt() {
  const [standalone, setStandalone] = useState(() => isStandaloneMode());
  const [bipEvent, setBipEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const canShow = useMemo(() => !standalone && !dismissed, [dismissed, standalone]);
  const showIOSGuide = useMemo(() => canShow && isIOS() && isSafari() && !bipEvent, [bipEvent, canShow]);
  const showInstallButton = useMemo(() => canShow && !!bipEvent, [bipEvent, canShow]);

  useEffect(() => {
    const onDisplayMode = () => setStandalone(isStandaloneMode());
    window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change', onDisplayMode);
    window.addEventListener('appinstalled', () => setStandalone(true));

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setBipEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    return () => {
      window.matchMedia?.('(display-mode: standalone)')?.removeEventListener?.('change', onDisplayMode);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  if (!canShow) return null;

  return (
    <div className="fixed left-1/2 z-[1400] w-[min(92vw,420px)] -translate-x-1/2 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="rounded-[1.75rem] border border-white/60 bg-white/80 px-5 py-4 text-[#111111] shadow-[0_18px_48px_-18px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {showIOSGuide && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-[#1D1D1F]" />
              <div className="text-sm font-black">添加到主屏幕</div>
            </div>
            <div className="text-[12px] font-semibold leading-relaxed text-[#6E6E73]">
              请用 iPhone 的 Safari 打开本页，点击底部“分享”按钮（方框上箭头），下滑选择“添加到主屏幕”，即可变成桌面 App。
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-full rounded-2xl bg-[#1D1D1F] py-3 text-[12px] font-black text-white active:scale-[0.98] transition-transform"
            >
              我知道了
            </button>
          </div>
        )}

        {showInstallButton && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-black">安装到桌面</div>
              <div className="mt-1 text-[12px] font-semibold text-[#6E6E73]">
                安装后可全屏使用，并获得更好的体验。
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!bipEvent) return;
                await bipEvent.prompt();
                void bipEvent.userChoice.finally(() => setBipEvent(null));
              }}
              className="flex items-center gap-2 rounded-2xl bg-[#1D1D1F] px-4 py-3 text-[12px] font-black text-white active:scale-[0.98] transition-transform"
            >
              <Download size={16} />
              安装
            </button>
          </div>
        )}

        {!showIOSGuide && !showInstallButton && (
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] font-semibold text-[#6E6E73]">
              将此应用安装到桌面以获得更佳体验。
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-2xl bg-zinc-100 px-4 py-2 text-[12px] font-black text-[#1D1D1F] active:scale-[0.98] transition-transform"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

