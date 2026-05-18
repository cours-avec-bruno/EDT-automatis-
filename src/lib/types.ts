export type SubjectKey =
  | 'physique' | 'tp-phys' | 'maths' | 'si' | 'tp-si'
  | 'francais' | 'python' | 'tipe' | 'oral'

export interface BaseEvent {
  date:  string   // YYYY-MM-DD
  label: string
  cat:   SubjectKey
  room:  string
  start: string   // HH:MM
  end:   string   // HH:MM
}

export interface OralEvent {
  matiere:     string
  type:        string
  date_label:  string
  date_iso:    string
  heure:       string
  heure_start: string | null
  heure_end:   string | null
  groupe:      string
  salle:       string
  professeur:  string
}

export interface ScheduleData {
  student:    string
  updated_at: string
  oraux:      OralEvent[]
  errors?:    string[]
}
