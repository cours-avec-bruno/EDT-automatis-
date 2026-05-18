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

  // Initialise on week containing today
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
    <div className="min-h-screen" style={{ background: '#080909' }}>
      <Navbar
        monday={WEEK_STARTS[weekIdx]}
        weekIndex={weekIdx}
        total={WEEK_STARTS.length}
        weekLabel=""
        onPrev={() => changeWeek(-1)}
        onNext={() => changeWeek(1)}
      />

      <TodayStrip events={BASE_SCHEDULE} oraux={oraux} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
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
