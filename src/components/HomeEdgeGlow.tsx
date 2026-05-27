import { useEffect } from 'react';
import { motion } from 'framer-motion';

/** 登录入场边缘流光 — 纯展示层，pointer-events-none */
export default function HomeEdgeGlow({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  return (
    <motion.div
      className="home-edge-glow pointer-events-none fixed inset-0 z-[998]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.7, delay: 1.55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <div className="home-edge-glow-ring" />
      <div className="home-edge-glow-soft" aria-hidden />
    </motion.div>
  );
}
