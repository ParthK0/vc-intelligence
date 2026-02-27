'use client'

import { motion, HTMLMotionProps, Variants, AnimatePresence } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

// ─── CARD HOVER EFFECT ────────────────────────────────────────────────────────

export const cardHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

// ─── MOTION COMPONENTS ────────────────────────────────────────────────────────

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  delay?: number
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
MotionCard.displayName = 'MotionCard'

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  delay?: number
}

export const FadeIn = ({ children, className, delay = 0, ...props }: FadeInProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={fadeIn}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

interface SlideUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  delay?: number
}

export const SlideUp = ({ children, className, delay = 0, ...props }: SlideUpProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={slideUp}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

interface StaggerListProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
}

export const StaggerList = ({ children, className, ...props }: StaggerListProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
    {...props}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className, ...props }: HTMLMotionProps<'div'> & { children: ReactNode }) => (
  <motion.div
    className={className}
    variants={staggerItem}
    {...props}
  >
    {children}
  </motion.div>
)

// ─── FILTER PANEL ANIMATION ───────────────────────────────────────────────────

interface CollapsiblePanelProps {
  isOpen: boolean
  children: ReactNode
  className?: string
}

export const CollapsiblePanel = ({ isOpen, children, className }: CollapsiblePanelProps) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        className={className}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

// ─── PAGE TRANSITION WRAPPER ──────────────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
)

// ─── SCORE GAUGE ANIMATION ────────────────────────────────────────────────────

interface AnimatedScoreProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const AnimatedScore = ({ 
  score, 
  maxScore = 100, 
  size = 'md',
  showLabel = true,
  className 
}: AnimatedScoreProps) => {
  const percentage = Math.min((score / maxScore) * 100, 100)
  const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = (pct: number) => {
    if (pct >= 80) return '#22c55e' // green
    if (pct >= 60) return '#84cc16' // lime
    if (pct >= 40) return '#eab308' // yellow
    if (pct >= 20) return '#f97316' // orange
    return '#ef4444' // red
  }

  const svgSize = (radius + strokeWidth) * 2
  const center = radius + strokeWidth

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {showLabel && (
        <motion.span
          className={`absolute font-semibold ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
          }`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {Math.round(score)}
        </motion.span>
      )}
    </div>
  )
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export const AnimatedCounter = ({ value, duration = 1, className }: AnimatedCounterProps) => (
  <motion.span
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      {value.toLocaleString()}
    </motion.span>
  </motion.span>
)

// ─── SKELETON LOADER WITH PULSE ───────────────────────────────────────────────

interface SkeletonPulseProps {
  className?: string
  width?: string | number
  height?: string | number
}

export const SkeletonPulse = ({ className, width, height }: SkeletonPulseProps) => (
  <motion.div
    className={`bg-zinc-200 dark:bg-zinc-700 rounded ${className}`}
    style={{ width, height }}
    animate={{
      opacity: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
)

// ─── LOADING SPINNER ──────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeMap = { sm: 16, md: 24, lg: 40 }
  const s = sizeMap[size]
  
  return (
    <motion.div
      className={className}
      style={{ width: s, height: s }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-20"
        />
        <motion.path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0.3 }}
          animate={{ pathLength: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  )
}

// ─── BADGE WITH PULSE ─────────────────────────────────────────────────────────

interface PulseBadgeProps {
  children: ReactNode
  className?: string
  pulse?: boolean
}

export const PulseBadge = ({ children, className, pulse = true }: PulseBadgeProps) => (
  <motion.span
    className={`relative inline-flex ${className}`}
    whileHover={{ scale: 1.05 }}
  >
    {pulse && (
      <motion.span
        className="absolute inset-0 rounded-full bg-current opacity-20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
    {children}
  </motion.span>
)

// Re-export AnimatePresence for convenience
export { AnimatePresence, motion }
