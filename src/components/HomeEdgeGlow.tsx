import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  applyIOSScreenCornerRadiusVars,
  clearIOSScreenCornerRadiusVars,
} from '../utils/iosScreenCornerRadius';

const ROOT_GLOW_CLASS = 'home-edge-glow-active';

/** 登录入场边缘流光 — 挂载至 body，穿透安全区与父级 transform 裁剪 */
export default function HomeEdgeGlow({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add(ROOT_GLOW_CLASS);
    applyIOSScreenCornerRadiusVars();
    return () => {
      document.documentElement.classList.remove(ROOT_GLOW_CLASS);
      clearIOSScreenCornerRadiusVars();
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="home-edge-glow"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.7, delay: 1.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <div className="home-edge-glow-ring" />
      <div className="home-edge-glow-soft" aria-hidden />
    </motion.div>,
    document.body
  );
}
