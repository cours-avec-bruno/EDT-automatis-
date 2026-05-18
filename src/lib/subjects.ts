import type { SubjectKey } from './types'

export interface SubjectConfig {
  label: string
  color: string
  bg:    string
  dot:   string
}

// Muted, desaturated — colors used only for 2px left borders
const CARD_BG = 'rgba(255,255,255,0.025)'

export const SUBJECTS: Record<SubjectKey, SubjectConfig> = {
  physique: {
    label: 'Physique',
    color: '#60a5fa',
    bg:    CARD_BG,
    dot:   '#60a5fa',
  },
  'tp-phys': {
    label: 'TP Physique',
    color: '#38bdf8',
    bg:    CARD_BG,
    dot:   '#38bdf8',
  },
  maths: {
    label: 'Maths',
    color: '#f472b6',
    bg:    CARD_BG,
    dot:   '#f472b6',
  },
  si: {
    label: 'SI',
    color: '#34d399',
    bg:    CARD_BG,
    dot:   '#34d399',
  },
  'tp-si': {
    label: 'TP SI',
    color: '#6ee7b7',
    bg:    CARD_BG,
    dot:   '#6ee7b7',
  },
  francais: {
    label: 'Français',
    color: '#fb923c',
    bg:    CARD_BG,
    dot:   '#fb923c',
  },
  python: {
    label: 'Python',
    color: '#fbbf24',
    bg:    CARD_BG,
    dot:   '#fbbf24',
  },
  tipe: {
    label: 'TIPE',
    color: '#a78bfa',
    bg:    CARD_BG,
    dot:   '#a78bfa',
  },
  oral: {
    label: 'Oral / Colle',
    color: '#8b5cf6',
    bg:    'rgba(139,92,246,0.08)',
    dot:   '#8b5cf6',
  },
}
