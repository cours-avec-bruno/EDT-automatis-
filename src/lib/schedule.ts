import type { BaseEvent } from './types'

export const BASE_SCHEDULE: BaseEvent[] = [
  // ── Lundi 18 mai ──────────────────────────────────────
  { date:'2026-05-18', label:'SI',          cat:'si',       room:'104', start:'08:30', end:'09:30' },
  { date:'2026-05-18', label:'Physique',    cat:'physique', room:'104', start:'10:05', end:'11:30' },
  { date:'2026-05-18', label:'Maths',       cat:'maths',    room:'104', start:'14:30', end:'15:30' },
  { date:'2026-05-18', label:'SI',          cat:'si',       room:'104', start:'16:30', end:'17:30' },
  // ── Mardi 19 mai ──────────────────────────────────────
  { date:'2026-05-19', label:'TP Physique', cat:'tp-phys',  room:'207', start:'09:30', end:'11:30' },
  { date:'2026-05-19', label:'TIPE',        cat:'tipe',     room:'104', start:'12:55', end:'15:45' },
  // ── Mercredi 20 mai ───────────────────────────────────
  { date:'2026-05-20', label:'Français',    cat:'francais', room:'104', start:'10:05', end:'11:05' },
  { date:'2026-05-20', label:'TP SI',       cat:'tp-si',    room:'114', start:'11:05', end:'12:30' },
  { date:'2026-05-20', label:'TP SI',       cat:'tp-si',    room:'114', start:'14:30', end:'15:30' },
  { date:'2026-05-20', label:'Physique',    cat:'physique', room:'104', start:'16:30', end:'17:30' },
  // ── Jeudi 21 mai ──────────────────────────────────────
  { date:'2026-05-21', label:'Python',      cat:'python',   room:'108', start:'08:30', end:'09:30' },
  { date:'2026-05-21', label:'TD SI',       cat:'si',       room:'104', start:'10:30', end:'11:30' },
  { date:'2026-05-21', label:'Maths',       cat:'maths',    room:'104', start:'13:50', end:'14:50' },
  // ── Vendredi 22 mai ───────────────────────────────────
  { date:'2026-05-22', label:'SI',          cat:'si',       room:'104', start:'08:30', end:'09:30' },
  { date:'2026-05-22', label:'Maths',       cat:'maths',    room:'104', start:'10:30', end:'11:30' },
  { date:'2026-05-22', label:'Physique',    cat:'physique', room:'104', start:'14:30', end:'15:30' },

  // ── Mardi 26 mai ──────────────────────────────────────
  { date:'2026-05-26', label:'TP Physique', cat:'tp-phys',  room:'208', start:'09:30', end:'11:30' },
  { date:'2026-05-26', label:'Maths',       cat:'maths',    room:'104', start:'13:50', end:'14:50' },
  { date:'2026-05-26', label:'Python',      cat:'python',   room:'108', start:'16:30', end:'17:30' },
  // ── Mercredi 27 mai ───────────────────────────────────
  { date:'2026-05-27', label:'Français',    cat:'francais', room:'104', start:'10:30', end:'11:30' },
  { date:'2026-05-27', label:'TP SI',       cat:'tp-si',    room:'114', start:'11:30', end:'12:30' },
  { date:'2026-05-27', label:'TP SI',       cat:'tp-si',    room:'114', start:'16:30', end:'17:30' },
  // ── Jeudi 28 mai ──────────────────────────────────────
  { date:'2026-05-28', label:'Python',      cat:'python',   room:'108', start:'08:30', end:'09:30' },
  { date:'2026-05-28', label:'TD SI',       cat:'si',       room:'104', start:'10:30', end:'11:30' },
  { date:'2026-05-28', label:'Physique',    cat:'physique', room:'104', start:'13:50', end:'15:30' },
  // ── Vendredi 29 mai ───────────────────────────────────
  { date:'2026-05-29', label:'Physique',    cat:'physique', room:'104', start:'10:30', end:'11:30' },
  { date:'2026-05-29', label:'Physique',    cat:'physique', room:'104', start:'14:30', end:'15:30' },
  { date:'2026-05-29', label:'TP SI',       cat:'tp-si',    room:'114', start:'16:30', end:'17:30' },

  // ── Lundi 1 juin ──────────────────────────────────────
  { date:'2026-06-01', label:'Physique',    cat:'physique', room:'104', start:'10:05', end:'11:30' },
  { date:'2026-06-01', label:'TD SI',       cat:'si',       room:'—',   start:'13:50', end:'14:50' },
  { date:'2026-06-01', label:'Maths',       cat:'maths',    room:'104', start:'16:30', end:'17:30' },
  // ── Mardi 2 juin ──────────────────────────────────────
  { date:'2026-06-02', label:'TP Physique', cat:'tp-phys',  room:'207', start:'09:30', end:'11:30' },
  { date:'2026-06-02', label:'Maths',       cat:'maths',    room:'104', start:'13:50', end:'14:50' },
  { date:'2026-06-02', label:'Python',      cat:'python',   room:'108', start:'16:30', end:'17:30' },
  // ── Mercredi 3 juin ───────────────────────────────────
  { date:'2026-06-03', label:'TP SI',       cat:'tp-si',    room:'114', start:'10:30', end:'12:30' },
  { date:'2026-06-03', label:'Physique',    cat:'physique', room:'104', start:'13:50', end:'15:30' },
  { date:'2026-06-03', label:'Physique',    cat:'physique', room:'104', start:'16:30', end:'17:30' },
  // ── Jeudi 4 juin ──────────────────────────────────────
  { date:'2026-06-04', label:'TD SI',       cat:'si',       room:'104', start:'09:30', end:'10:30' },
  { date:'2026-06-04', label:'TP SI',       cat:'tp-si',    room:'114', start:'10:30', end:'11:30' },
  { date:'2026-06-04', label:'Physique',    cat:'physique', room:'104', start:'13:50', end:'15:30' },
  // ── Vendredi 5 juin ───────────────────────────────────
  { date:'2026-06-05', label:'TD SI',       cat:'si',       room:'—',   start:'10:30', end:'11:30' },
  { date:'2026-06-05', label:'Physique',    cat:'physique', room:'104', start:'14:30', end:'15:30' },
  { date:'2026-06-05', label:'TP SI',       cat:'tp-si',    room:'114', start:'16:30', end:'17:30' },

  // ── Mardi 9 juin ──────────────────────────────────────
  { date:'2026-06-09', label:'TP Physique', cat:'tp-phys',  room:'207', start:'09:30', end:'11:30' },
  // ── Mardi 16 juin ─────────────────────────────────────
  { date:'2026-06-16', label:'TP Physique', cat:'tp-phys',  room:'207', start:'09:30', end:'11:30' },
]

export const HOLIDAYS: Record<string, string> = {
  '2026-05-25': 'Lundi de Pentecôte',
}

// Lundi de chaque semaine displayée
export const WEEK_STARTS = [
  '2026-05-18', '2026-05-25', '2026-06-01',
  '2026-06-08', '2026-06-15', '2026-06-22',
]

export function weekDays(monday: string): string[] {
  const d = new Date(monday + 'T12:00:00')
  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    return day.toISOString().slice(0, 10)
  })
}
