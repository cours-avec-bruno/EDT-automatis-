'use client'
import { useState, useEffect, useCallback } from 'react'
import { WEEK_STARTS, BASE_SCHEDULE, weekDays } from '@/lib/schedule'
import { todayISO } from '@/lib/utils'
import type { ScheduleData } from '@/lib/types'
import Navbar       from '@/components/Navbar'
import WeekCalendar from '@/components/WeekCalendar'
import TodayStrip   from '@/components/TodayStrip'
import OrauxPanel   from '@/components/OrauxPanel'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Page() {
  const [weekIdx,   setWeekIdx]   = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [schedule,  setSchedule]  = useState<ScheduleData | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const today = todayISO()
    const idx = WEEK_STARTS.findIndex(mon => {
      const days = weekDays(mon)
      return days.includes(today) || mon > today
    })
    setWeekIdx(Math.max(0, idx < 0 ? WEEK_STARTS.length - 1 : idx))
  }, [])

  const fetchOraux = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${BASE_PATH}/data/oraux_ricci.json?t=${Date.now()}`)
      if (r.ok) setSchedule(await r.json())
    } catch (_) { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchOraux()
    const id = setInterval(fetchOraux, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchOraux])

  function changeWeek(delta: 1 | -1) {
    setDirection(delta)
    setWeekIdx(i => Math.max(0, Math.min(WEEK_STARTS.length - 1, i + delta)))
  }

  const oraux = schedule?.oraux ?? []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar
        monday={WEEK_STARTS[weekIdx]}
        weekIndex={weekIdx}
        total={WEEK_STARTS.length}
        weekLabel=""
        onPrev={() => changeWeek(-1)}
        onNext={() => changeWeek(1)}
      />

      <TodayStrip events={BASE_SCHEDULE} oraux={oraux} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Page header */}
        <div className="py-10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center h-5 px-2 rounded text-[10px] font-medium tracking-widest uppercase"
              style={{ background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid var(--accent-border)' }}
            >
              Préparation 2026
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight leading-none" style={{ color: 'var(--text-1)' }}>
            Bruno Ricci
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {[
              { label: 'Classe', value: 'PT' },
              { label: 'TD', value: 'Groupe A (TD1)' },
              { label: 'TP SI', value: 'Groupe 1' },
              { label: 'TP Physique', value: 'Groupe 1' },
            ].map(({ label, value }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px]"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                }}
              >
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--text-1)' }}>{value}</span>
              </span>
            ))}
          </div>
        </div>

        <WeekCalendar
          monday={WEEK_STARTS[weekIdx]}
          events={BASE_SCHEDULE}
          oraux={oraux}
          direction={direction}
        />

        <OrauxPanel
          oraux={oraux}
          updatedAt={schedule?.updated_at}
          loading={loading}
        />
      </main>
    </div>
  )
}
