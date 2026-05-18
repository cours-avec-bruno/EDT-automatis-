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

export default function Navbar({ weekLabel, weekIndex, total, onPrev, onNext, monday }: Props) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: 'rgba(8,9,9,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: identity */}
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          BR
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
          Bruno Ricci
        </span>
        <span
          className="hidden sm:inline-flex items-center h-5 px-2 rounded text-[10px] font-medium tracking-wide uppercase"
          style={{ background: 'var(--border)', color: 'var(--text-3)' }}
        >
          PT · Groupe A
        </span>
      </div>

      {/* Center: week nav */}
      <div className="flex items-center gap-2">
        <NavBtn onClick={onPrev} disabled={weekIndex === 0}>
          <ChevLeft />
        </NavBtn>

        <motion.span
          key={monday}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="text-sm font-medium min-w-[200px] text-center"
          style={{ color: 'var(--text-2)' }}
        >
          {fmtWeekRange(monday)}
        </motion.span>

        <NavBtn onClick={onNext} disabled={weekIndex === total - 1}>
          <ChevRight />
        </NavBtn>
      </div>

      {/* Right: week counter */}
      <div className="text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>
        Sem. {weekIndex + 1}/{total}
      </div>
    </header>
  )
}

function NavBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-20"
      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)' }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

const ChevLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
