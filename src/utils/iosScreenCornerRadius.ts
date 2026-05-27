/** 读取 env(safe-area-inset-top) 的实际计算值（px） */
function readSafeAreaInsetTop(): number {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);';
  document.body.appendChild(probe);
  const top = parseFloat(getComputedStyle(probe).paddingTop);
  document.body.removeChild(probe);
  return Number.isFinite(top) ? top : 0;
}

/** 基于安全区 + 屏幕逻辑像素，推算 iOS 外屏连续圆角曲率（CSS px） */
function radiusFromSafeAreaAndScreen(shortSide: number, safeTop: number): number {
  const safeBoost = safeTop > 50 ? 26 : safeTop > 44 ? 22 : safeTop > 20 ? 16 : 10;
  const widthBoost = shortSide >= 440 ? 14 : shortSide >= 402 ? 12 : shortSide >= 393 ? 10 : shortSide >= 390 ? 6 : 0;
  return Math.round(Math.max(38, Math.min(56, safeTop * 0.68 + safeBoost + widthBoost)));
}

/**
 * 全系 iPhone 物理外屏圆角 — 设备像素表 + 安全区动态兜底（无写死全局固定值）
 * 参考 Apple 各代逻辑分辨率与 Display Corner Radius 公开测算值
 */
export function resolveIOSScreenCornerRadiusPx(): number {
  if (typeof window === 'undefined') return 44;

  const w = window.screen.width;
  const h = window.screen.height;
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  const safeTop = readSafeAreaInsetTop();

  // iPhone 16 Pro Max / 15 Pro Max / 14 Pro Max
  if (short >= 440 && long >= 956) return 55;
  // iPhone 16 Pro / 新 Pro 逻辑宽
  if (short >= 402 && long >= 874) return 55;
  // Plus / Pro Max 428–430 宽
  if (short >= 428 && long >= 926) return 54;
  // iPhone 14–16 Pro / 标准 Pro 393–402
  if (short >= 393 && long >= 852) return radiusFromSafeAreaAndScreen(short, safeTop);
  // iPhone 13/14/15/16 标准版 390
  if (short >= 390 && long >= 844) return 47;
  // mini / X 系列 375×812
  if (short >= 375 && long >= 812 && long < 844) return 44;
  // SE / 小屏
  if (short <= 375 && long <= 667) return 38;

  return radiusFromSafeAreaAndScreen(short, safeTop);
}

export function applyIOSScreenCornerRadiusVars(target: HTMLElement = document.documentElement): void {
  const radiusPx = resolveIOSScreenCornerRadiusPx();
  target.style.setProperty('--ios-screen-corner-radius', `${radiusPx}px`);
  target.style.setProperty('--home-edge-bleed', '0px');
  target.style.setProperty('--home-edge-inset', '1px');
  target.style.setProperty('--home-edge-stroke', '5px');
}

export function clearIOSScreenCornerRadiusVars(target: HTMLElement = document.documentElement): void {
  target.style.removeProperty('--ios-screen-corner-radius');
  target.style.removeProperty('--home-edge-bleed');
  target.style.removeProperty('--home-edge-inset');
  target.style.removeProperty('--home-edge-stroke');
}
