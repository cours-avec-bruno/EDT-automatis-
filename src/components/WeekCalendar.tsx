'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUBJECTS } from '@/lib/subjects'
import { HOLIDAYS, weekDays as getWeekDays } from '@/lib/schedule'
import type { BaseEvent, OralEvent } from '@/lib/types'
import {
  fmtDayShort, todayISO,
  timeToPct, durationToPct, fmtTime,
  CAL_START, CAL_SPAN,
} from '@/lib/utils'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const CAL_HEIGHT = 700

interface Props {
  monday:    string
  events:    BaseEvent[]
  oraux:     OralEvent[]
  direction: 1 | -1
}

export default function WeekCalendar({ monday, events, oraux, direction }: Props) {
  const days  = getWeekDays(monday)
  const today = todayISO()
  const isCurrentWeek = days.includes(today)

  const [nowPct, setNowPct] = useState<number | null>(null)

  useEffect(() => {
    if (!isCurrentWeek) { setNowPct(null); return }
    function update() {
      const now  = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      const pct  = ((mins - CAL_START) / CAL_SPAN) * 100
      setNowPct(pct >= 0 && pct <= 100 ? pct : null)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [isCurrentWeek])

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 mb-3">
        {(Object.entries(SUBJECTS) as [string, typeof SUBJECTS[keyof typeof SUBJECTS]][]).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
            {s.label}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={monday}
          custom={direction}
          variants={{
            enter:  (d: number) => ({ x: d * 20, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit:   (d: number) => ({ x: d * -20, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          {/* Day headers */}
          <div className="grid" style={{ gridTemplateColumns: '48px repeat(5, 1fr)' }}>
            <div style={{ borderBottom: '1px solid var(--border)' }} />
            {days.map(iso => {
              const { name, num, month } = fmtDayShort(iso)
              const isToday   = iso === today
              const isHoliday = !!HOLIDAYS[iso]
              return (
                <div
                  key={iso}
                  className="flex flex-col items-center justify-center py-4 gap-px"
                  style={{
                    borderLeft: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: isToday ? 'rgba(139,92,246,0.04)' : 'transparent',
                  }}
                >
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{ color: isToday ? 'var(--accent-2)' : 'var(--text-3)' }}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-[16px] font-semibold leading-none mt-1 flex items-center justify-center ${isToday ? 'w-8 h-8 rounded-full' : ''}`}
                    style={{
                      color: isToday ? '#fff' : isHoliday ? 'var(--text-3)' : 'var(--text-1)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      boxShadow: isToday ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                    }}
                  >
                    {num}
                  </span>
                  <span className="text-[10px] mt-px" style={{ color: 'var(--text-3)' }}>{month}</span>
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          <div className="grid relative" style={{ gridTemplateColumns: '48px repeat(5, 1fr)' }}>
            {/* Time axis */}
            <div className="relative" style={{ height: CAL_HEIGHT }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute right-3 text-[10px] tabular-nums leading-none"
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
              const holiday  = HOLIDAYS[iso]
              const isToday  = iso === today
              const dayBase  = events.filter(e => e.date === iso)
              const dayOral  = oraux.filter(o => o.date_iso === iso && o.heure_start && o.heure_end)

              return (
                <div
                  key={iso}
                  className="relative"
                  style={{
                    height: CAL_HEIGHT,
                    borderLeft: '1px solid var(--border)',
                    background: isToday ? 'rgba(139,92,246,0.02)' : 'transparent',
                  }}
                >
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{
                        top: `${((h * 60 - CAL_START) / CAL_SPAN) * 100}%`,
                        borderTop: h % 2 === 0
                          ? '1px solid rgba(255,255,255,0.04)'
                          : '1px dashed rgba(255,255,255,0.025)',
                      }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && nowPct !== null && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${nowPct}%` }}
                    >
                      <div
                        className="absolute -left-1 -top-1 w-2 h-2 rounded-full"
                        style={{ background: 'var(--accent-2)', boxShadow: '0 0 8px rgba(139,92,246,0.8)' }}
                      />
                      <div style={{ height: 1, background: 'var(--accent-2)', opacity: 0.7, boxShadow: '0 0 6px rgba(139,92,246,0.4)' }} />
                    </div>
                  )}

                  {/* Holiday */}
                  {holiday && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-[10px] font-medium px-2.5 py-1 rounded-md"
                        style={{ color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >
                        {holiday}
                      </span>
                    </div>
                  )}

                  {!holiday && dayBase.map((ev, i) => <EventBlock key={i} ev={ev} />)}
                  {!holiday && dayOral.map((o, i) => <OralBlock key={`o-${i}`} oral={o} />)}
                </div>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EventBlock({ ev }: { ev: BaseEvent }) {
  const subj   = SUBJECTS[ev.cat]
  const top    = timeToPct(ev.start)
  const height = Math.max(durationToPct(ev.start, ev.end), 2.8)
  const short  = height < 5.5

  return (
    <motion.div
      className="absolute rounded-[5px] overflow-hidden cursor-default select-none"
      style={{
        top:        `${top}%`,
        height:     `${height}%`,
        left:       5,
        right:      5,
        background: 'var(--surface-2)',
        borderLeft: `2px solid ${subj.color}`,
      }}
      whileHover={{
        y: -1,
        background: 'var(--surface-3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        transition: { duration: 0.1 },
      }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-center">
        <span
          className="text-[11px] font-semibold leading-tight truncate"
          style={{ color: 'var(--text-1)' }}
        >
          {ev.label}
        </span>
        {!short && (
          <span
            className="text-[10px] leading-tight truncate mt-px"
            style={{ color: 'var(--text-3)' }}
          >
            {ev.room !== '—' ? `${ev.room} · ` : ''}{fmtTime(ev.start)}–{fmtTime(ev.end)}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function OralBlock({ oral }: { oral: OralEvent }) {
  const top    = timeToPct(oral.heure_start!)
  const height = Math.max(durationToPct(oral.heure_start!, oral.heure_end!), 2.8)
  const short  = height < 5.5

  return (
    <motion.div
      className="absolute rounded-[5px] overflow-hidden cursor-default select-none"
      style={{
        top:        `${top}%`,
        height:     `${height}%`,
        left:       5,
        right:      5,
        background: 'rgba(124,58,237,0.07)',
        borderLeft: `2px solid var(--accent-2)`,
        boxShadow:  '0 0 0 1px rgba(139,92,246,0.1)',
      }}
      animate={{
        boxShadow: [
          '0 0 0 1px rgba(139,92,246,0.1)',
          '0 0 12px rgba(139,92,246,0.2), 0 0 0 1px rgba(139,92,246,0.16)',
          '0 0 0 1px rgba(139,92,246,0.1)',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ y: -1, background: 'rgba(124,58,237,0.11)' }}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-center">
        <span
          className="text-[11px] font-semibold leading-tight truncate"
          style={{ color: 'var(--accent-2)' }}
        >
          {oral.type}
        </span>
        {!short && (
          <span
            className="text-[10px] leading-tight truncate mt-px"
            style={{ color: 'var(--text-3)' }}
          >
            {oral.professeur !== '—' ? oral.professeur : oral.matiere}
          </span>
        )}
      </div>
    </motion.div>
  )
}
