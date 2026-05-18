'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { SUBJECTS } from '@/lib/subjects'
import { HOLIDAYS, weekDays as getWeekDays } from '@/lib/schedule'
import type { BaseEvent, OralEvent } from '@/lib/types'
import {
  fmtDayShort, todayISO,
  timeToPct, durationToPct, fmtTime,
  CAL_START, CAL_SPAN,
} from '@/lib/utils'

// Hour ticks to display on the time axis
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

interface Props {
  monday:   string
  events:   BaseEvent[]
  oraux:    OralEvent[]
  direction: 1 | -1
}

export default function WeekCalendar({ monday, events, oraux, direction }: Props) {
  const days  = getWeekDays(monday)
  const today = todayISO()

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={monday}
        custom={direction}
        variants={{
          enter:  (d: number) => ({ x: d * 40, opacity: 0 }),
          center: { x: 0, opacity: 1 },
          exit:   (d: number) => ({ x: d * -40, opacity: 0 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        className="w-full"
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: '#0d0e0f' }}
        >
          {/* ── Day headers ── */}
          <div className="grid" style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}>
            <div style={{ borderBottom: '1px solid var(--border)' }} />
            {days.map(iso => {
              const { name, num, month } = fmtDayShort(iso)
              const isToday = iso === today
              return (
                <div
                  key={iso}
                  className="flex flex-col items-center justify-center py-3 gap-0.5"
                  style={{
                    borderLeft: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: isToday ? 'rgba(99,102,241,0.05)' : 'transparent',
                  }}
                >
                  <span
                    className="text-[10px] font-medium uppercase tracking-widest"
                    style={{ color: isToday ? 'var(--accent-2)' : 'var(--text-3)' }}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-base font-semibold leading-none ${isToday ? 'w-7 h-7 rounded-full flex items-center justify-center' : ''}`}
                    style={{
                      color: isToday ? '#fff' : 'var(--text-1)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {num}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>{month}</span>
                </div>
              )
            })}
          </div>

          {/* ── Time grid + events ── */}
          <div className="grid relative" style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}>
            {/* Time axis */}
            <div className="relative" style={{ height: 660 }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute right-3 text-[10px] tabular-nums"
                  style={{
                    top: `${((h * 60 - CAL_START) / CAL_SPAN) * 100}%`,
                    transform: 'translateY(-50%)',
                    color: 'var(--text-3)',
                  }}
                >
                  {h}h
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map(iso => {
              const holiday = HOLIDAYS[iso]
              const isToday = iso === today
              const dayBase  = events.filter(e => e.date === iso)
              const dayOral  = oraux.filter(o => o.date_iso === iso && o.heure_start && o.heure_end)

              return (
                <div
                  key={iso}
                  className="relative"
                  style={{
                    height: 660,
                    borderLeft: '1px solid var(--border)',
                    background: isToday ? 'rgba(99,102,241,0.025)' : 'transparent',
                  }}
                >
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${((h * 60 - CAL_START) / CAL_SPAN) * 100}%`,
                        borderTop: '1px solid var(--border)',
                      }}
                    />
                  ))}

                  {/* Holiday overlay */}
                  {holiday && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                        {holiday}
                      </span>
                    </div>
                  )}

                  {/* Base events */}
                  {!holiday && dayBase.map((ev, i) => (
                    <EventBlock key={i} ev={ev} />
                  ))}

                  {/* Oral events */}
                  {!holiday && dayOral.map((o, i) => (
                    <OralBlock key={`o-${i}`} oral={o} />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Event block ───────────────────────────────────────── */
function EventBlock({ ev }: { ev: BaseEvent }) {
  const subj = SUBJECTS[ev.cat]
  const top    = timeToPct(ev.start)
  const height = Math.max(durationToPct(ev.start, ev.end), 3)
  const short  = height < 6  // very short block

  return (
    <motion.div
      className="absolute left-1.5 right-1.5 rounded-md overflow-hidden cursor-default select-none"
      style={{
        top:    `${top}%`,
        height: `${height}%`,
        background: subj.bg,
        borderLeft: `2px solid ${subj.color}`,
      }}
      whileHover={{ y: -1, boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}
      transition={{ duration: 0.12 }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-center gap-px">
        <span
          className="text-[11px] font-semibold leading-tight truncate"
          style={{ color: subj.color }}
        >
          {ev.label}
        </span>
        {!short && (
          <span className="text-[10px] leading-tight truncate" style={{ color: 'var(--text-3)' }}>
            {ev.room !== '—' ? `Salle ${ev.room}` : ''}
            {ev.room !== '—' ? ' · ' : ''}
            {fmtTime(ev.start)}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ── Oral / Colle block ─────────────────────────────────── */
function OralBlock({ oral }: { oral: OralEvent }) {
  const subj = SUBJECTS.oral
  const top    = timeToPct(oral.heure_start!)
  const height = Math.max(durationToPct(oral.heure_start!, oral.heure_end!), 3)

  return (
    <motion.div
      className="absolute left-1.5 right-1.5 rounded-md overflow-hidden cursor-default select-none"
      style={{
        top:    `${top}%`,
        height: `${height}%`,
        background: subj.bg,
        borderLeft: `2px solid ${subj.color}`,
        boxShadow: `0 0 0 1px rgba(99,102,241,0.15)`,
      }}
      animate={{ boxShadow: ['0 0 0 1px rgba(99,102,241,0.15)', '0 0 8px rgba(99,102,241,0.25)', '0 0 0 1px rgba(99,102,241,0.15)'] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ y: -1 }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-center gap-px">
        <span className="text-[11px] font-semibold leading-tight truncate" style={{ color: subj.color }}>
          {oral.type}
        </span>
        <span className="text-[10px] leading-tight truncate" style={{ color: 'var(--text-3)' }}>
          {oral.professeur !== '—' ? oral.professeur : oral.matiere}
        </span>
      </div>
    </motion.div>
  )
}
