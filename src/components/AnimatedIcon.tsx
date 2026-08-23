import React, { useState } from 'react';
import {
  Clock,
  Timer,
  Flame,
  Zap,
  BookOpen,
  GraduationCap,
  Layers,
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  Brain,
  Target,
  FileText,
  Files,
  FileEdit,
  Folder,
  FolderTree,
  Music,
  Code,
  Laptop,
  Lightbulb,
  MessageSquare,
  FlaskConical,
  Atom,
  Palette,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Scale,
  Stethoscope,
  Globe,
  Smile,
  Bot,
  Crown,
  Medal,
  Trophy,
  Star,
  Shield,
  Gem,
  Sprout,
  Calculator,
  Compass,
  Cpu,
  Leaf,
  Dna,
  Scroll,
  MapPin,
  Landmark,
  Radio,
  FileCode,
  FileSpreadsheet,
  Calendar,
  Check,
  Plus,
  Trash2,
  Search,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  Upload,
  Eye,
  Heart,
  UserCheck,
  FlameKindling,
  Wand2,
} from 'lucide-react';
import { motion, Variants } from 'motion/react';

export type IconType =
  | 'clock'
  | 'timer'
  | 'flame'
  | 'zap'
  | 'book'
  | 'graduation'
  | 'layers'
  | 'deck'
  | 'chart'
  | 'trending'
  | 'trophy'
  | 'sparkles'
  | 'brain'
  | 'target'
  | 'document'
  | 'files'
  | 'edit'
  | 'folder'
  | 'folder-tree'
  | 'music'
  | 'code'
  | 'laptop'
  | 'lightbulb'
  | 'chat'
  | 'science'
  | 'microscope'
  | 'atom'
  | 'palette'
  | 'check'
  | 'scale'
  | 'medical'
  | 'globe'
  | 'wave'
  | 'bot'
  | 'crown'
  | 'medal'
  | 'gold-medal'
  | 'silver-medal'
  | 'bronze-medal'
  | 'star'
  | 'diamond'
  | 'shield'
  | 'sprout'
  | 'math'
  | 'physics'
  | 'literature'
  | 'economics'
  | 'engineering'
  | 'biology'
  | 'history'
  | 'philosophy'
  | 'languages'
  | 'pdf'
  | 'audio'
  | 'text'
  | 'calendar'
  | 'plus'
  | 'trash'
  | 'search'
  | 'mic'
  | 'wand'
  | string;

interface AnimatedIconProps {
  type: IconType;
  className?: string;
  size?: number | string;
  onClick?: () => void;
  interactive?: boolean;
  animateContinuous?: boolean;
}

// Map raw emojis to corresponding icon types
export const mapEmojiToIconType = (input: string): IconType => {
  const clean = input?.trim();
  switch (clean) {
    case '🥇': return 'gold-medal';
    case '🥈': return 'silver-medal';
    case '🥉': return 'bronze-medal';
    case '👑': return 'crown';
    case '🏆': return 'trophy';
    case '⭐':
    case '🌟':
    case '✨': return 'sparkles';
    case '💎': return 'diamond';
    case '🛡️':
    case '🛡': return 'shield';
    case '🌱': return 'sprout';
    case '🎓': return 'graduation';
    case '📖':
    case '📚': return 'book';
    case '🧠': return 'brain';
    case '⚡': return 'zap';
    case '🔥': return 'flame';
    case '🎯': return 'target';
    case '📐':
    case '🔢': return 'math';
    case '⚛️':
    case '⚛': return 'atom';
    case '📊':
    case '📈': return 'chart';
    case '⚙️':
    case '⚙': return 'engineering';
    case '🌿': return 'biology';
    case '🌍':
    case '🌐': return 'globe';
    case '🏛️':
    case '🏛': return 'philosophy';
    case '💻':
    case '🖥️': return 'laptop';
    case '🔬': return 'science';
    case '💡': return 'lightbulb';
    case '📜': return 'history';
    case '🌊': return 'wave';
    case '🩺': return 'medical';
    case '⚖️':
    case '⚖': return 'scale';
    case '📅': return 'calendar';
    case '⏱️':
    case '⏱':
    case '⌛': return 'timer';
    case '⏰':
    case '🕒': return 'clock';
    case '📝':
    case '✍️': return 'edit';
    case '✅': return 'check';
    case '📄': return 'pdf';
    case '🎵': return 'audio';
    case '👋': return 'wave';
    case '🤖': return 'bot';
    case '🚀': return 'zap';
    case '🎉': return 'sparkles';
    default: return input || 'document';
  }
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  type,
  className = 'w-4 h-4',
  onClick,
  interactive = true,
  animateContinuous = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const resolvedType = mapEmojiToIconType(type);

  const handleClick = (e: React.MouseEvent) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 700);
    if (onClick) onClick();
  };

  const renderIcon = () => {
    switch (resolvedType) {
      case 'gold-medal':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { y: [0, -3, 0], scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }
                : isHovered || isClicked
                ? { rotate: [-10, 10, -6, 6, 0], scale: 1.3 }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              duration: animateContinuous ? 2.5 : 0.6,
              repeat: animateContinuous ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
          >
            <div className="relative flex items-center justify-center">
              <Medal className={className} />
              <Crown className="w-2.5 h-2.5 absolute -top-1 text-yellow-300 drop-shadow-xs" />
            </div>
          </motion.div>
        );

      case 'silver-medal':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { y: [0, -2, 0], scale: [1, 1.05, 1] }
                : isHovered || isClicked
                ? { rotate: [-8, 8, -4, 4, 0], scale: 1.25 }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              duration: animateContinuous ? 2.5 : 0.6,
              repeat: animateContinuous ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center text-slate-300 dark:text-zinc-200 drop-shadow-[0_2px_6px_rgba(148,163,184,0.5)]"
          >
            <Medal className={className} />
          </motion.div>
        );

      case 'bronze-medal':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { y: [0, -2, 0], scale: [1, 1.05, 1] }
                : isHovered || isClicked
                ? { rotate: [-6, 6, -3, 3, 0], scale: 1.2 }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              duration: animateContinuous ? 2.5 : 0.6,
              repeat: animateContinuous ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center text-amber-700 dark:text-amber-500 drop-shadow-[0_2px_6px_rgba(180,83,9,0.4)]"
          >
            <Medal className={className} />
          </motion.div>
        );

      case 'crown':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { y: [0, -3, 0], rotate: [0, 4, -4, 0], scale: [1, 1.1, 1] }
                : isHovered || isClicked
                ? { y: -4, rotate: [-12, 12, 0], scale: 1.3 }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{
              duration: animateContinuous ? 2.2 : 0.5,
              repeat: animateContinuous ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center text-yellow-500 dark:text-yellow-400"
          >
            <Crown className={className} />
          </motion.div>
        );

      case 'trophy':
        return (
          <motion.div
            animate={
              isHovered || isClicked
                ? { rotate: [-10, 10, -6, 6, 0], scale: 1.3 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center text-amber-500 dark:text-amber-400"
          >
            <Trophy className={className} />
          </motion.div>
        );

      case 'star':
      case 'sparkles':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { rotate: [0, 180, 360], scale: [1, 1.2, 1] }
                : isHovered
                ? { scale: 1.35, rotate: 180 }
                : { scale: 1, rotate: 0 }
            }
            transition={{
              duration: animateContinuous ? 4 : 0.5,
              repeat: animateContinuous ? Infinity : 0,
              ease: 'linear',
            }}
            className="inline-flex items-center justify-center text-[#65A30D] dark:text-[#D4F94E]"
          >
            <Sparkles className={className} />
          </motion.div>
        );

      case 'diamond':
      case 'gem':
        return (
          <motion.div
            animate={
              isHovered || isClicked
                ? { scale: [1, 1.3, 1.15, 1.25, 1], filter: 'drop-shadow(0 0 8px #06b6d4)' }
                : { scale: 1, filter: 'none' }
            }
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center text-cyan-500 dark:text-cyan-400"
          >
            <Gem className={className} />
          </motion.div>
        );

      case 'shield':
        return (
          <motion.div
            animate={isHovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-flex items-center justify-center text-indigo-500 dark:text-indigo-400"
          >
            <Shield className={className} />
          </motion.div>
        );

      case 'sprout':
        return (
          <motion.div
            animate={
              isHovered
                ? { rotate: [-10, 10, -5, 5, 0], scale: 1.25 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center text-emerald-500"
          >
            <Sprout className={className} />
          </motion.div>
        );

      case 'clock':
        return (
          <motion.div
            animate={
              isClicked
                ? { rotate: 360, scale: 1.2 }
                : isHovered
                ? { rotate: 180, scale: 1.15 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center justify-center"
          >
            <Clock className={className} />
          </motion.div>
        );

      case 'timer':
        return (
          <motion.div
            animate={
              isClicked
                ? { rotate: -360, scale: 1.25 }
                : isHovered
                ? { rotate: -45, scale: 1.15 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center justify-center text-amber-500"
          >
            <Timer className={className} />
          </motion.div>
        );

      case 'flame':
        return (
          <motion.div
            animate={
              animateContinuous
                ? {
                    scale: [1, 1.15, 1.05, 1.18, 1],
                    rotate: [0, -5, 5, -3, 0],
                  }
                : isHovered || isClicked
                ? {
                    scale: [1, 1.3, 1.1, 1.25, 1],
                    rotate: [0, -10, 8, -6, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{
              duration: animateContinuous ? 1.5 : 0.8,
              repeat: animateContinuous || isHovered ? Infinity : 0,
            }}
            className="inline-flex items-center justify-center text-orange-500 dark:text-orange-400"
          >
            <Flame className={className} />
          </motion.div>
        );

      case 'zap':
        return (
          <motion.div
            animate={
              isHovered || isClicked
                ? { scale: [1, 1.3, 1.1, 1.25, 1], rotate: [0, 15, -10, 8, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center text-amber-400"
          >
            <Zap className={className} />
          </motion.div>
        );

      case 'book':
      case 'literature':
        return (
          <motion.div
            animate={
              isHovered
                ? { y: -3, scale: 1.2, rotateY: 30 }
                : { y: 0, scale: 1, rotateY: 0 }
            }
            transition={{ duration: 0.35 }}
            className="inline-flex items-center justify-center text-blue-500 dark:text-blue-400"
          >
            <BookOpen className={className} />
          </motion.div>
        );

      case 'graduation':
        return (
          <motion.div
            animate={
              isHovered
                ? { y: -4, rotate: -12, scale: 1.25 }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-flex items-center justify-center text-purple-500 dark:text-purple-400"
          >
            <GraduationCap className={className} />
          </motion.div>
        );

      case 'layers':
      case 'deck':
        return (
          <motion.div
            animate={
              isHovered
                ? { scale: 1.2, rotate: 8, y: -2 }
                : { scale: 1, rotate: 0, y: 0 }
            }
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center text-indigo-500 dark:text-indigo-400"
          >
            <Layers className={className} />
          </motion.div>
        );

      case 'chart':
      case 'trending':
      case 'economics':
        return (
          <motion.div
            animate={
              isHovered
                ? { scale: 1.25, y: -3, rotate: 5 }
                : { scale: 1, y: 0, rotate: 0 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 12 }}
            className="inline-flex items-center justify-center text-emerald-500"
          >
            <TrendingUp className={className} />
          </motion.div>
        );

      case 'brain':
        return (
          <motion.div
            animate={
              isHovered
                ? { scale: [1, 1.2, 1.15, 1.25, 1], filter: 'drop-shadow(0 0 6px #a855f7)' }
                : { scale: 1, filter: 'none' }
            }
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center text-purple-500 dark:text-purple-400"
          >
            <Brain className={className} />
          </motion.div>
        );

      case 'target':
        return (
          <motion.div
            animate={
              isHovered
                ? { rotate: 90, scale: 1.25 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="inline-flex items-center justify-center text-rose-500"
          >
            <Target className={className} />
          </motion.div>
        );

      case 'math':
        return (
          <motion.div
            animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center justify-center text-blue-500 dark:text-blue-400"
          >
            <Calculator className={className} />
          </motion.div>
        );

      case 'physics':
      case 'atom':
        return (
          <motion.div
            animate={
              animateContinuous
                ? { rotate: 360 }
                : isHovered
                ? { rotate: 360, scale: 1.25 }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              duration: animateContinuous ? 4 : 1.2,
              repeat: animateContinuous || isHovered ? Infinity : 0,
              ease: 'linear',
            }}
            className="inline-flex items-center justify-center text-indigo-500 dark:text-indigo-400"
          >
            <Atom className={className} />
          </motion.div>
        );

      case 'engineering':
        return (
          <motion.div
            animate={isHovered ? { rotate: 90, scale: 1.2 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center text-cyan-500"
          >
            <Cpu className={className} />
          </motion.div>
        );

      case 'biology':
        return (
          <motion.div
            animate={isHovered ? { rotate: [-10, 15, -5, 0], scale: 1.25 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center text-emerald-500"
          >
            <Leaf className={className} />
          </motion.div>
        );

      case 'history':
        return (
          <motion.div
            animate={isHovered ? { y: -2, scale: 1.2 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center justify-center text-amber-600 dark:text-amber-500"
          >
            <Scroll className={className} />
          </motion.div>
        );

      case 'philosophy':
        return (
          <motion.div
            animate={isHovered ? { scale: 1.25, rotate: 8 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center text-fuchsia-500"
          >
            <Landmark className={className} />
          </motion.div>
        );

      case 'code':
      case 'laptop':
        return (
          <motion.div
            animate={isHovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center justify-center text-cyan-500"
          >
            <Laptop className={className} />
          </motion.div>
        );

      case 'science':
      case 'microscope':
        return (
          <motion.div
            animate={
              isHovered
                ? { rotate: [-15, 15, -10, 10, 0], scale: 1.2 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center text-teal-500"
          >
            <FlaskConical className={className} />
          </motion.div>
        );

      case 'lightbulb':
        return (
          <motion.div
            animate={
              isHovered
                ? { scale: 1.25, filter: 'drop-shadow(0 0 8px #eab308)' }
                : { scale: 1, filter: 'none' }
            }
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center text-amber-500"
          >
            <Lightbulb className={className} />
          </motion.div>
        );

      case 'check':
        return (
          <motion.div
            animate={
              isHovered || isClicked
                ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center text-emerald-500"
          >
            <CheckCircle2 className={className} />
          </motion.div>
        );

      case 'medical':
        return (
          <motion.div
            animate={isHovered ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center text-rose-500"
          >
            <Stethoscope className={className} />
          </motion.div>
        );

      case 'scale':
        return (
          <motion.div
            animate={isHovered ? { rotate: [-10, 10, -5, 5, 0], scale: 1.15 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center text-indigo-500"
          >
            <Scale className={className} />
          </motion.div>
        );

      case 'globe':
        return (
          <motion.div
            animate={isHovered ? { rotate: 180, scale: 1.15 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center text-teal-500"
          >
            <Globe className={className} />
          </motion.div>
        );

      case 'wave':
        return (
          <motion.div
            animate={{
              rotate: [0, 14, -8, 14, -4, 10, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center text-amber-500 origin-bottom-right"
          >
            <HandWaveIcon className={className} />
          </motion.div>
        );

      case 'bot':
        return (
          <motion.div
            animate={
              isHovered
                ? { y: [-2, 2, -2], rotate: [-4, 4, -4], scale: 1.2 }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
            className="inline-flex items-center justify-center text-lime-500 dark:text-[#D4F94E]"
          >
            <Bot className={className} />
          </motion.div>
        );

      case 'pdf':
        return (
          <motion.div
            animate={isHovered ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center text-rose-500"
          >
            <FileText className={className} />
          </motion.div>
        );

      case 'audio':
        return (
          <motion.div
            animate={
              isHovered
                ? { scale: [1, 1.25, 1.1, 1.2, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center text-purple-500"
          >
            <Music className={className} />
          </motion.div>
        );

      case 'text':
      case 'document':
      default:
        return (
          <motion.div
            animate={isHovered ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center text-slate-600 dark:text-slate-300"
          >
            <FileText className={className} />
          </motion.div>
        );
    }
  };

  if (!interactive) {
    return <span className="inline-flex items-center justify-center shrink-0">{renderIcon()}</span>;
  }

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="inline-flex items-center justify-center cursor-pointer transition-transform select-none shrink-0"
    >
      {renderIcon()}
    </span>
  );
};

// Animated Vector Greeting Hand Icon
const HandWaveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
