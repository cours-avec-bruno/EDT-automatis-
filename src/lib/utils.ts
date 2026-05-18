import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

const FR_DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const FR_MONTHS = ['jan','fév','mars','avr','mai','juin','juil','août','sep','oct','nov','déc']

export function fmtDayShort(iso: string): { name: string; num: number; month: string } {
  const d = new Date(iso + 'T12:00:00')
  return { name: FR_DAYS[d.getDay()].slice(0, 3), num: d.getDate(), month: FR_MONTHS[d.getMonth()] }
}

export function fmtWeekRange(monIso: string): string {
  const mon = new Date(monIso + 'T12:00:00')
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  const sm = FR_MONTHS[mon.getMonth()], fm = FR_MONTHS[fri.getMonth()]
  if (sm === fm) return `${mon.getDate()} – ${fri.getDate()} ${fm} ${fri.getFullYear()}`
  return `${mon.getDate()} ${sm} – ${fri.getDate()} ${fm} ${fri.getFullYear()}`
}

export function fmtLongDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`
}

// time "HH:MM" → minutes since midnight
export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const CAL_START = toMin('08:00')
export const CAL_END   = toMin('18:30')
export const CAL_SPAN  = CAL_END - CAL_START  // 630 min

export function timeToPct(hhmm: string): number {
  return ((toMin(hhmm) - CAL_START) / CAL_SPAN) * 100
}

export function durationToPct(start: string, end: string): number {
  return ((toMin(end) - toMin(start)) / CAL_SPAN) * 100
}

export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${h}h` : `${h}h${m}`
}
