import type { SubjectKey } from './types'

export interface SubjectConfig {
  label:  string
  color:  string   // CSS color for text / border
  bg:     string   // subtle background
  dot:    string   // full opacity dot
}

export const SUBJECTS: Record<SubjectKey, SubjectConfig> = {
  physique: {
    label: 'Physique',
    color: 'hsl(210 88% 62%)',
    bg:    'hsl(210 88% 62% / 0.08)',
    dot:   'hsl(210 88% 62%)',
  },
  'tp-phys': {
    label: 'TP Physique',
    color: 'hsl(205 78% 58%)',
    bg:    'hsl(205 78% 58% / 0.08)',
    dot:   'hsl(205 78% 58%)',
  },
  maths: {
    label: 'Maths',
    color: 'hsl(347 82% 65%)',
    bg:    'hsl(347 82% 65% / 0.08)',
    dot:   'hsl(347 82% 65%)',
  },
  si: {
    label: 'SI',
    color: 'hsl(158 65% 50%)',
    bg:    'hsl(158 65% 50% / 0.08)',
    dot:   'hsl(158 65% 50%)',
  },
  'tp-si': {
    label: 'TP SI',
    color: 'hsl(152 58% 50%)',
    bg:    'hsl(152 58% 50% / 0.08)',
    dot:   'hsl(152 58% 50%)',
  },
  francais: {
    label: 'Français',
    color: 'hsl(36 88% 57%)',
    bg:    'hsl(36 88% 57% / 0.08)',
    dot:   'hsl(36 88% 57%)',
  },
  python: {
    label: 'Python',
    color: 'hsl(192 85% 52%)',
    bg:    'hsl(192 85% 52% / 0.08)',
    dot:   'hsl(192 85% 52%)',
  },
  tipe: {
    label: 'TIPE',
    color: 'hsl(261 74% 68%)',
    bg:    'hsl(261 74% 68% / 0.08)',
    dot:   'hsl(261 74% 68%)',
  },
  oral: {
    label: 'Oral / Colle',
    color: 'hsl(245 75% 68%)',
    bg:    'hsl(245 75% 68% / 0.12)',
    dot:   'hsl(245 75% 68%)',
  },
}
