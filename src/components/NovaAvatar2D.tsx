import React from 'react';
import { motion, Variants } from 'motion/react';

export type NovaExpression =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'nodding'
  | 'celebrating'
  | 'speaking'
  | 'questioning'
  | 'happy'
  | 'waving';

interface NovaAvatar2DProps {
  expression?: NovaExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'onboarding';
  showAura?: boolean;
  showAccessories?: boolean;
  className?: string;
  onClick?: () => void;
  speechText?: string;
  isFloating?: boolean;
}

export const NovaAvatar2D: React.FC<NovaAvatar2DProps> = ({
  expression = 'idle',
  size = 'md',
  showAura = true,
  showAccessories = true,
  className = '',
  onClick,
  speechText,
  isFloating = true,
}) => {
  // Dimension mappings
  const sizeMap = {
    xs: { box: 'w-6 h-6', robot: 24, face: 'w-5 h-5' },
    sm: { box: 'w-8 h-8', robot: 32, face: 'w-7 h-7' },
    md: { box: 'w-12 h-12', robot: 48, face: 'w-10 h-10' },
    lg: { box: 'w-16 h-16', robot: 64, face: 'w-14 h-14' },
    xl: { box: 'w-24 h-24', robot: 96, face: 'w-20 h-20' },
    '2xl': { box: 'w-32 h-32', robot: 128, face: 'w-28 h-28' },
    hero: { box: 'w-40 h-40 md:w-48 md:h-48', robot: 180, face: 'w-36 h-36 md:w-44 md:h-44' },
    onboarding: { box: 'w-48 h-48 md:w-56 md:h-56', robot: 220, face: 'w-44 h-44 md:w-52 md:h-52' },
  };

  const currentSize = sizeMap[size];

  // Head/Body float variants
  const floatVariants: Variants = {
    idle: {
      y: [0, -6, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    listening: {
      y: [0, -3, 0],
      scale: [1, 1.05, 1],
      rotate: [0, -3, 0],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
    },
    thinking: {
      y: [0, -5, -2, -5, 0],
      rotate: [0, 6, 8, 4, 0],
      transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
    },
    nodding: {
      y: [0, 6, -3, 6, 0],
      rotate: [0, 0, 0, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
    celebrating: {
      y: [0, -12, 3, -10, 0],
      rotate: [0, -8, 8, -4, 0],
      scale: [1, 1.12, 1, 1.08, 1],
      transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
    },
    speaking: {
      y: [0, -4, 1, -4, 0],
      rotate: [0, 2, -2, 1, 0],
      transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' as const },
    },
    questioning: {
      y: [0, -6, -2, 0],
      rotate: [0, 10, 12, 8, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
    },
    waving: {
      y: [0, -4, 0],
      rotate: [0, 3, -3, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  // Aura colors based on expression
  const auraGlow = {
    idle: 'from-[#D4F94E]/40 via-[#65A30D]/20 to-transparent',
    listening: 'from-emerald-400/60 via-cyan-400/30 to-transparent',
    thinking: 'from-purple-500/60 via-indigo-400/30 to-transparent',
    nodding: 'from-lime-400/60 via-emerald-400/30 to-transparent',
    celebrating: 'from-amber-400/70 via-rose-400/40 to-transparent',
    speaking: 'from-cyan-400/60 via-[#D4F94E]/40 to-transparent',
    questioning: 'from-purple-400/60 via-amber-400/30 to-transparent',
    happy: 'from-amber-400/60 via-emerald-400/30 to-transparent',
    waving: 'from-teal-400/60 via-[#D4F94E]/40 to-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${currentSize.box} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* 2D AMBIENT AURA GLOW */}
      {showAura && (
        <motion.div
          animate={{
            scale:
              expression === 'celebrating' || expression === 'listening' || expression === 'speaking'
                ? [1, 1.3, 1]
                : [1, 1.15, 1],
            opacity: expression === 'celebrating' ? [0.6, 0.9, 0.6] : [0.35, 0.65, 0.35],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -inset-2 rounded-full bg-gradient-to-tr ${auraGlow[expression]} blur-lg pointer-events-none`}
        />
      )}

      {/* SPEECH BUBBLE IF PROVIDED */}
      {speechText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-zinc-850 text-[#161922] dark:text-white px-3 py-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold z-30 pointer-events-none flex items-center gap-1.5"
        >
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-850 border-b border-r border-slate-200 dark:border-zinc-700 rotate-45" />
        </motion.div>
      )}

      {/* 2D MASCOT CONTAINER */}
      <motion.div
        variants={isFloating ? floatVariants : undefined}
        animate={expression}
        className="relative flex flex-col items-center justify-center"
      >
        {/* SVG VECTOR 2D NOVA MASCOT */}
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ANTENNA STEM & ORB */}
          <g>
            <motion.path
              d="M80 34 V18"
              stroke="#94A3B8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* ANTENNA GLOWING BULB */}
            <motion.circle
              cx="80"
              cy="14"
              r="7"
              fill={
                expression === 'celebrating'
                  ? '#F59E0B'
                  : expression === 'thinking' || expression === 'questioning'
                  ? '#A855F7'
                  : expression === 'listening'
                  ? '#10B981'
                  : '#D4F94E'
              }
              animate={{
                scale: expression === 'thinking' ? [1, 1.25, 1] : expression === 'speaking' ? [1, 1.35, 1] : [1, 1.1, 1],
                filter: [
                  'drop-shadow(0 0 4px rgba(212,249,78,0.8))',
                  'drop-shadow(0 0 10px rgba(212,249,78,1))',
                  'drop-shadow(0 0 4px rgba(212,249,78,0.8))',
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* SPARKLE RING WHEN CELEBRATING */}
            {(expression === 'celebrating' || expression === 'happy') && (
              <motion.circle
                cx="80"
                cy="14"
                r="12"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="3 3"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </g>

          {/* HEAD OUTER CHASSIS (ROBOTIC SMOOTH 2D SHAPE) */}
          <rect
            x="24"
            y="32"
            width="112"
            height="96"
            rx="36"
            fill="url(#headGradient)"
            stroke="#334155"
            strokeWidth="3.5"
          />

          {/* HEAD VISOR / SCREEN FACE (DARK OLED 2D VISOR) */}
          <rect
            x="34"
            y="42"
            width="92"
            height="76"
            rx="26"
            fill="#0F172A"
            stroke="#1E293B"
            strokeWidth="2.5"
          />

          {/* VISOR INNER AMBIENT HIGHLIGHT */}
          <path
            d="M42 50 C60 46, 100 46, 118 50"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.15"
          />

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2D EYES EXPRESSIONS (FRAME ANIMATED)                              */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {expression === 'idle' && (
            <g>
              {/* LEFT EYE */}
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
                style={{ originX: '56px', originY: '78px' }}
              >
                <circle cx="58" cy="78" r="9" fill="#D4F94E" />
                <circle cx="56" cy="75" r="3" fill="#FFFFFF" />
              </motion.g>
              {/* RIGHT EYE */}
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
                style={{ originX: '102px', originY: '78px' }}
              >
                <circle cx="102" cy="78" r="9" fill="#D4F94E" />
                <circle cx="100" cy="75" r="3" fill="#FFFFFF" />
              </motion.g>
              {/* SMILE */}
              <path
                d="M74 88 Q80 93 86 88"
                stroke="#D4F94E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {expression === 'listening' && (
            <g>
              {/* LISTENING WAVEFORM EYES */}
              <motion.path
                d="M50 78 Q58 68 66 78"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={{ d: ['M50 78 Q58 68 66 78', 'M50 78 Q58 88 66 78', 'M50 78 Q58 68 66 78'] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.path
                d="M94 78 Q102 68 110 78"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={{ d: ['M94 78 Q102 68 110 78', 'M94 78 Q102 88 110 78', 'M94 78 Q102 68 110 78'] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {/* SOUND WAVE PULSES AROUND EARS */}
              <circle cx="80" cy="88" r="3" fill="#10B981" />
            </g>
          )}

          {expression === 'thinking' && (
            <g>
              {/* THINKING SQUINT / LOOK UP */}
              <motion.g
                animate={{ x: [0, 4, 4, 0], y: [0, -3, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <circle cx="58" cy="75" r="8" fill="#A855F7" />
                <circle cx="56" cy="72" r="2.5" fill="#FFFFFF" />
                <circle cx="102" cy="75" r="8" fill="#A855F7" />
                <circle cx="100" cy="72" r="2.5" fill="#FFFFFF" />
              </motion.g>
              {/* THINKING PUZZLED MOUTH */}
              <path
                d="M75 88 L85 88"
                stroke="#A855F7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* THINKING GEAR OR LIGHTBULB BUBBLE */}
              <motion.circle
                cx="116"
                cy="54"
                r="4"
                fill="#F59E0B"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </g>
          )}

          {expression === 'questioning' && (
            <g>
              {/* ONE EYE WIDE, ONE EYE SQUINT */}
              <circle cx="58" cy="76" r="10" fill="#A855F7" />
              <circle cx="56" cy="73" r="3" fill="#FFFFFF" />
              <path
                d="M96 78 Q102 73 108 78"
                stroke="#A855F7"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* QUESTION MARK IN CORNER */}
              <text
                x="112"
                y="58"
                fill="#D4F94E"
                fontSize="16"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
              >
                ?
              </text>
              <path
                d="M76 89 Q80 86 84 89"
                stroke="#A855F7"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {(expression === 'celebrating' || expression === 'happy') && (
            <g>
              {/* HAPPY ARC EYES (^^) */}
              <path
                d="M50 78 Q58 68 66 78"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M94 78 Q102 68 110 78"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* OPEN BIG JOYFUL MOUTH */}
              <path
                d="M72 85 Q80 96 88 85 Z"
                fill="#F59E0B"
              />
              {/* BLUSH CHEEKS */}
              <ellipse cx="48" cy="85" rx="5" ry="3" fill="#F43F5E" fillOpacity="0.4" />
              <ellipse cx="112" cy="85" rx="5" ry="3" fill="#F43F5E" fillOpacity="0.4" />
            </g>
          )}

          {(expression === 'speaking' || expression === 'nodding' || expression === 'waving') && (
            <g>
              {/* ATTENTIVE FRIENDLY EYES */}
              <circle cx="58" cy="76" r="9" fill="#38BDF8" />
              <circle cx="56" cy="73" r="3" fill="#FFFFFF" />
              <circle cx="102" cy="76" r="9" fill="#38BDF8" />
              <circle cx="100" cy="73" r="3" fill="#FFFFFF" />
              {/* ANIMATED TALKING MOUTH */}
              <motion.path
                d="M74 88 Q80 94 86 88"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: [
                    'M74 88 Q80 94 86 88',
                    'M74 86 Q80 96 86 86',
                    'M74 88 Q80 90 86 88',
                    'M74 88 Q80 94 86 88',
                  ],
                }}
                transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
              />
            </g>
          )}

          {/* 2D EAR CAPS (SIDE HEADPHONES) */}
          <g>
            {/* LEFT EAR CAP */}
            <rect
              x="16"
              y="60"
              width="10"
              height="36"
              rx="5"
              fill="#475569"
              stroke="#1E293B"
              strokeWidth="2"
            />
            {/* RIGHT EAR CAP */}
            <rect
              x="134"
              y="60"
              width="10"
              height="36"
              rx="5"
              fill="#475569"
              stroke="#1E293B"
              strokeWidth="2"
            />
          </g>

          {/* GRADIENTS DEFINITION */}
          <defs>
            <linearGradient id="headGradient" x1="80" y1="32" x2="80" y2="128" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="0.5" stopColor="#0F172A" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};
