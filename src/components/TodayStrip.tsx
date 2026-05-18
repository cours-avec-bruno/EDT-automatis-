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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-4 px-6 py-3 overflow-x-auto"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: 'var(--accent)' }}
        />
        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-2)' }}>
          {fmtLongDate(today)}
        </span>
      </div>

      <div className="w-px h-4 shrink-0" style={{ background: 'var(--border-strong)' }} />

      <div className="flex items-center gap-2 flex-nowrap">
        {todayBase.map((ev, i) => {
          const s = SUBJECTS[ev.cat]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-1.5 h-6 px-2.5 rounded-md shrink-0"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: s.color }}>
                {fmtTime(ev.start)} {ev.label}
              </span>
            </motion.div>
          )
        })}

        {todayOral.map((o, i) => {
          const s = SUBJECTS.oral
          return (
            <motion.div
              key={`o${i}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * (todayBase.length + i) }}
              className="flex items-center gap-1.5 h-6 px-2.5 rounded-md shrink-0"
              style={{ background: s.bg, border: `1px solid ${s.color}33` }}
            >
              <span className="w-1 h-1 rounded-full animate-pulse-soft shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: s.color }}>
                {o.heure_start ? fmtTime(o.heure_start) : ''} {o.type}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
