import React from 'react';
import { motion } from 'motion/react';
import { Crown, Medal, Sparkles, Star, Shield, Trophy, Award, Flame } from 'lucide-react';
import { AnimatedIcon, mapEmojiToIconType } from './AnimatedIcon';

interface TopMedalProps {
  rank: number; // 1, 2, 3
  size?: 'sm' | 'md' | 'lg';
  showCrown?: boolean;
  className?: string;
}

export const TopMedal: React.FC<TopMedalProps> = ({
  rank,
  size = 'md',
  showCrown = true,
  className = '',
}) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  if (isFirst) {
    return (
      <motion.div
        animate={{
          y: [0, -4, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.18, rotate: [0, -8, 8, 0] }}
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-[#161922] font-black shadow-[0_4px_14px_rgba(245,158,11,0.45)] border border-yellow-200 ${sizeClasses[size]} ${className}`}
        title="1ère Place (Médaille d'Or)"
      >
        {/* Shimmering Aura */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-1 rounded-2xl bg-yellow-400/40 blur-xs -z-10"
        />

        {showCrown && (
          <motion.div
            animate={{
              y: [0, -2, 0],
              rotate: [0, 6, -6, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-3 text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
          >
            <Crown className="w-4 h-4 fill-yellow-400" />
          </motion.div>
        )}

        <div className="flex items-center justify-center">
          <Medal className={`${iconSizes[size]} fill-amber-300 stroke-[#161922] stroke-[2.2]`} />
        </div>
      </motion.div>
    );
  }

  if (isSecond) {
    return (
      <motion.div
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.15 }}
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 via-slate-300 to-zinc-400 text-slate-900 font-black shadow-[0_4px_12px_rgba(148,163,184,0.35)] border border-slate-100 ${sizeClasses[size]} ${className}`}
        title="2ème Place (Médaille d'Argent)"
      >
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.18, 1],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-1 rounded-2xl bg-slate-300/30 blur-xs -z-10"
        />

        <div className="flex items-center justify-center">
          <Medal className={`${iconSizes[size]} fill-slate-200 stroke-slate-800 stroke-[2]`} />
        </div>
      </motion.div>
    );
  }

  if (isThird) {
    return (
      <motion.div
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.12 }}
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white font-black shadow-[0_4px_12px_rgba(217,119,6,0.35)] border border-amber-400/40 ${sizeClasses[size]} ${className}`}
        title="3ème Place (Médaille de Bronze)"
      >
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-1 rounded-2xl bg-amber-600/30 blur-xs -z-10"
        />

        <div className="flex items-center justify-center">
          <Medal className={`${iconSizes[size]} fill-amber-500 stroke-amber-950 stroke-[2]`} />
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-zinc-700 ${sizeClasses[size]} ${className}`}
    >
      #{rank}
    </div>
  );
};

// Animated Achievement & Level Badge
export const AnimatedBadge: React.FC<{
  icon: string;
  rarity?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}> = ({
  icon,
  rarity = 'silver',
  unlocked = true,
  size = 'md',
  label,
  className = '',
}) => {
  const rarityColors = {
    bronze: 'from-amber-600 to-orange-700 border-amber-500 text-amber-100 shadow-amber-900/20',
    silver: 'from-slate-300 via-slate-200 to-zinc-400 border-slate-300 text-slate-900 shadow-slate-500/20',
    gold: 'from-yellow-300 via-amber-400 to-yellow-500 border-yellow-200 text-[#161922] shadow-yellow-500/30',
    diamond: 'from-cyan-300 via-blue-400 to-indigo-500 border-cyan-200 text-white shadow-cyan-500/30',
    legendary: 'from-fuchsia-400 via-purple-500 to-pink-500 border-fuchsia-200 text-white shadow-purple-500/40',
  };

  const badgeSize = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <motion.div
      animate={
        unlocked
          ? {
              y: [0, -3, 0],
            }
          : {}
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={unlocked ? { scale: 1.12, rotate: [0, -4, 4, 0] } : {}}
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
    >
      <div
        className={`rounded-2xl flex items-center justify-center font-black border-2 transition-all ${
          badgeSize[size]
        } ${
          unlocked
            ? `bg-gradient-to-br ${rarityColors[rarity]} shadow-lg`
            : 'bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-400 grayscale opacity-60'
        }`}
      >
        {unlocked && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent -z-10 opacity-50"
          />
        )}
        <AnimatedIcon type={mapEmojiToIconType(icon)} size={20} />
      </div>

      {label && (
        <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
          {label}
        </span>
      )}
    </motion.div>
  );
};
