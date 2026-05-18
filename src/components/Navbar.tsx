'use client'
import { motion } from 'framer-motion'
import { fmtWeekRange } from '@/lib/utils'

interface Props {
  weekLabel: string
  weekIndex: number
  total:     number
  onPrev:    () => void
  onNext:    () => void
  monday:    string
}

export default function Navbar({ weekIndex, total, onPrev, onNext, monday }: Props) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-12"
      style={{
        background: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: identity */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold tracking-tight shrink-0"
          style={{
            background: 'var(--accent-sub)',
            color: 'var(--accent-2)',
            border: '1px solid var(--accent-border)',
          }}
        >
          BR
        </div>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>
          Bruno Ricci
        </span>
        <span className="hidden sm:inline text-[11px]" style={{ color: 'var(--text-3)' }}>
          PT · A
        </span>
      </div>

      {/* Center: week nav */}
      <div className="flex items-center gap-1">
        <NavBtn onClick={onPrev} disabled={weekIndex === 0}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </NavBtn>

        <motion.span
          key={monday}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="px-3 text-[13px] font-medium min-w-[190px] text-center"
          style={{ color: 'var(--text-2)' }}
        >
          {fmtWeekRange(monday)}
        </motion.span>

        <NavBtn onClick={onNext} disabled={weekIndex === total - 1}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </NavBtn>
      </div>

      {/* Right: counter */}
      <div className="text-[11px] tabular-nums w-10 text-right" style={{ color: 'var(--text-3)' }}>
        {weekIndex + 1}/{total}
      </div>
    </header>
  )
}

function NavBtn({
  onClick, disabled, children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
      style={{ color: 'var(--text-2)', background: 'transparent' }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
