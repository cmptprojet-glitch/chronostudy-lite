import React from 'react';
import { motion, Variants } from 'motion/react';

export type NovaExpression = 'idle' | 'listening' | 'thinking' | 'nodding' | 'celebrating' | 'speaking';

interface NovaAvatar3DProps {
  expression?: NovaExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showAura?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NovaAvatar3D: React.FC<NovaAvatar3DProps> = ({
  expression = 'idle',
  size = 'md',
  showAura = true,
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const sizeMap = {
    sm: { box: 'w-8 h-8', head: 'w-7 h-7', eye: 'w-1 h-2', iris: 'w-1 h-1' },
    md: { box: 'w-12 h-12', head: 'w-10 h-10', eye: 'w-1.5 h-3', iris: 'w-1.5 h-1.5' },
    lg: { box: 'w-16 h-16', head: 'w-14 h-14', eye: 'w-2 h-4', iris: 'w-2 h-2' },
    xl: { box: 'w-24 h-24', head: 'w-20 h-20', eye: 'w-3 h-5.5', iris: 'w-3 h-3' },
    '2xl': { box: 'w-32 h-32', head: 'w-28 h-28', eye: 'w-4 h-7', iris: 'w-3.5 h-3.5' },
    hero: { box: 'w-40 h-40 md:w-48 md:h-48', head: 'w-36 h-36 md:w-44 md:h-44', eye: 'w-5 h-9 md:w-6 md:h-10', iris: 'w-4.5 h-4.5 md:w-5 md:h-5' },
  };

  const currentSize = sizeMap[size];

  // Head bobbing / rotation animation variants based on expression
  const headVariants: Variants = {
    idle: {
      y: [0, -3, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    listening: {
      scale: [1, 1.05, 1],
      y: [0, -2, 0],
      rotate: [0, -4, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    thinking: {
      rotate: [0, 8, 6, 8],
      y: [0, -4, -2, -4],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    nodding: {
      y: [0, 5, -2, 5, 0],
      rotate: [0, 0, 0, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
    celebrating: {
      y: [0, -8, 2, -6, 0],
      rotate: [0, -10, 10, -5, 0],
      scale: [1, 1.12, 1, 1.08, 1],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const },
    },
    speaking: {
      y: [0, -2, 1, -2, 0],
      rotate: [0, 2, -2, 1, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  // Eyes animation variants
  const eyeVariants: Variants = {
    idle: {
      scaleY: [1, 1, 0.1, 1, 1],
      transition: { duration: 3.8, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] },
    },
    listening: {
      scale: [1, 1.25, 1.1],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
    thinking: {
      x: [0, 2, 2, 0],
      y: [0, -2, -2, 0],
      scaleY: [1, 0.85, 0.85, 1],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    nodding: {
      scaleY: [1, 0.3, 1],
      transition: { duration: 0.8, repeat: Infinity },
    },
    celebrating: {
      scale: [1, 1.3, 1],
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.6, repeat: Infinity },
    },
    speaking: {
      scaleY: [1, 1.15, 0.9, 1.1, 1],
      transition: { duration: 0.7, repeat: Infinity },
    },
  };

  // Aura colors
  const auraGlow = {
    idle: 'from-[#D4F94E]/40 via-[#65A30D]/20 to-transparent',
    listening: 'from-emerald-400/60 via-cyan-400/30 to-transparent',
    thinking: 'from-purple-500/60 via-indigo-400/30 to-transparent',
    nodding: 'from-lime-400/60 via-emerald-400/30 to-transparent',
    celebrating: 'from-amber-400/70 via-rose-400/40 to-transparent',
    speaking: 'from-blue-400/60 via-[#D4F94E]/40 to-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${currentSize.box} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* 3D HOLOGRAPHIC AMBIENT GLOW / AURA */}
      {showAura && (
        <motion.div
          animate={{
            scale: expression === 'celebrating' || expression === 'listening' ? [1, 1.35, 1] : [1, 1.18, 1],
            opacity: expression === 'celebrating' ? [0.6, 0.9, 0.6] : [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${auraGlow[expression]} blur-md pointer-events-none`}
        />
      )}

      {/* FLOATING 3D ORBIT RING */}
      {(expression === 'thinking' || expression === 'celebrating' || expression === 'listening') && (
        <motion.div
          animate={{ rotate: 360, rotateX: 60 }}
          transition={{ duration: expression === 'celebrating' ? 2 : 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-[#D4F94E]/70 pointer-events-none"
        />
      )}

      {/* 3D AVATAR HEAD CHASSIS */}
      <motion.div
        variants={headVariants}
        animate={expression}
        className={`relative ${currentSize.head} rounded-2xl md:rounded-3xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-center overflow-hidden`}
        style={{
          boxShadow:
            expression === 'celebrating'
              ? '0 0 24px rgba(251, 191, 36, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
              : expression === 'listening'
              ? '0 0 20px rgba(52, 211, 153, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
              : expression === 'thinking'
              ? '0 0 20px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
              : '0 8px 18px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* GLOSSY 3D VISOR REFLECTION */}
        <div className="absolute -top-3 -left-3 w-10 h-6 bg-white/15 rounded-full blur-[2px] transform -rotate-45 pointer-events-none" />

        {/* ANTENNA / ENERGY NODE */}
        <motion.div
          animate={{
            scale: expression === 'listening' || expression === 'thinking' ? [1, 1.4, 1] : [1, 1.1, 1],
            backgroundColor:
              expression === 'celebrating'
                ? '#FBBF24'
                : expression === 'thinking'
                ? '#C084FC'
                : expression === 'listening'
                ? '#34D399'
                : '#D4F94E',
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1 w-1.5 h-1.5 rounded-full shadow-sm shadow-current"
        />

        {/* FACE SCREEN / VISOR */}
        <div className="w-[85%] h-[68%] rounded-xl bg-[#0a0f1d] border border-cyan-500/30 flex flex-col items-center justify-center relative px-1 pt-1.5 shadow-inner">
          
          {/* DIGITAL EYES */}
          <div className="flex items-center justify-center gap-2 w-full">
            {/* LEFT EYE */}
            <motion.div
              variants={eyeVariants}
              animate={expression}
              className={`${currentSize.eye} rounded-full flex items-center justify-center ${
                expression === 'celebrating'
                  ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24]'
                  : expression === 'thinking'
                  ? 'bg-purple-400 shadow-[0_0_8px_#C084FC]'
                  : expression === 'listening'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                  : 'bg-[#D4F94E] shadow-[0_0_8px_#D4F94E]'
              }`}
            >
              {expression === 'celebrating' ? (
                <span className="text-[7px] font-black text-black">★</span>
              ) : (
                <div className={`${currentSize.iris} bg-black/40 rounded-full`} />
              )}
            </motion.div>

            {/* RIGHT EYE */}
            <motion.div
              variants={eyeVariants}
              animate={expression}
              className={`${currentSize.eye} rounded-full flex items-center justify-center ${
                expression === 'celebrating'
                  ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24]'
                  : expression === 'thinking'
                  ? 'bg-purple-400 shadow-[0_0_8px_#C084FC]'
                  : expression === 'listening'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                  : 'bg-[#D4F94E] shadow-[0_0_8px_#D4F94E]'
              }`}
            >
              {expression === 'celebrating' ? (
                <span className="text-[7px] font-black text-black">★</span>
              ) : (
                <div className={`${currentSize.iris} bg-black/40 rounded-full`} />
              )}
            </motion.div>
          </div>

          {/* DYNAMIC MOUTH / AUDIO SOUNDWAVE LINE */}
          <div className="mt-1 flex items-center justify-center gap-0.5 h-2">
            {expression === 'speaking' ? (
              // Active Waveform when speaking
              [0.4, 0.9, 0.5, 1, 0.6, 0.3].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.3, h * 1.5, 0.3] }}
                  transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.06 }}
                  className="w-0.5 h-2 bg-[#D4F94E] rounded-full"
                />
              ))
            ) : expression === 'listening' ? (
              // Listening pulse line
              [0.6, 1, 0.6].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.4, 1.2, 0.4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 h-1.5 bg-emerald-400 rounded-full"
                />
              ))
            ) : expression === 'celebrating' ? (
              // Happy smile curve
              <div className="w-3.5 h-1 border-b-2 border-amber-400 rounded-full" />
            ) : expression === 'nodding' ? (
              // Gentle smile
              <div className="w-3 h-1 border-b-2 border-[#D4F94E] rounded-full" />
            ) : expression === 'thinking' ? (
              // Small curious circle
              <div className="w-1.5 h-1.5 rounded-full border border-purple-400 animate-spin" />
            ) : (
              // Idle calm dot
              <div className="w-1.5 h-0.5 bg-[#D4F94E]/60 rounded-full" />
            )}
          </div>
        </div>

        {/* SIDE AUDIO SENSOR NODES */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-slate-600 rounded-r" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-slate-600 rounded-l" />
      </motion.div>

      {/* CELEBRATION SPARKLES / STARS */}
      {expression === 'celebrating' && (
        <>
          <motion.span
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], x: -14, y: -14 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute text-amber-300 text-xs font-bold pointer-events-none"
          >
            ✨
          </motion.span>
          <motion.span
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], x: 14, y: -12 }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            className="absolute text-amber-300 text-xs font-bold pointer-events-none"
          >
            ⭐
          </motion.span>
        </>
      )}
    </div>
  );
};
