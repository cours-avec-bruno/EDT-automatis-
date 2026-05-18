'use client'
import { motion } from 'framer-motion'
import { SUBJECTS } from '@/lib/subjects'
import type { BaseEvent, OralEvent } from '@/lib/types'
import { todayISO, fmtLongDate, fmtTime } from '@/lib/utils'

interface Props {
  events: BaseEvent[]
  oraux:  OralEvent[]
}

export default function TodayStrip({ events, oraux }: Props) {
  const today     = todayISO()
  const todayBase = events.filter(e => e.date === today).sort((a, b) => a.start.localeCompare(b.start))
  const todayOral = oraux.filter(o => o.date_iso === today)

  if (!todayBase.length && !todayOral.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex items-center gap-5 px-6 py-2.5 overflow-x-auto"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Date */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: 'var(--accent-2)', boxShadow: '0 0 6px rgba(139,92,246,0.55)' }}
        />
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>
          {fmtLongDate(today)}
        </span>
      </div>

      <span className="w-px h-3.5 shrink-0" style={{ background: 'var(--border-hover)' }} />

      {/* Events */}
      <div className="flex items-center gap-1.5 flex-nowrap">
        {todayBase.map((ev, i) => {
          const s = SUBJECTS[ev.cat]
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.15, duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 h-6 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0"
              style={{
                color: 'var(--text-1)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
              {fmtTime(ev.start)} {ev.label}
            </motion.span>
          )
        })}

        {todayOral.map((o, i) => (
          <motion.span
            key={`o${i}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * (todayBase.length + i) + 0.15, duration: 0.2 }}
            className="flex items-center gap-1.5 px-2.5 h-6 rounded-md text-[11px] font-medium whitespace-nowrap shrink-0"
            style={{
              color: 'var(--accent-2)',
              background: 'var(--accent-sub)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--accent-2)', boxShadow: '0 0 5px rgba(139,92,246,0.6)' }}
            />
            {o.heure_start ? fmtTime(o.heure_start) : ''} {o.type}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
