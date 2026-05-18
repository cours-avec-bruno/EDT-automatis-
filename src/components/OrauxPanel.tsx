'use client'
import { motion } from 'framer-motion'
import { SUBJECTS } from '@/lib/subjects'
import type { OralEvent } from '@/lib/types'
import { fmtTime } from '@/lib/utils'

interface Props {
  oraux:      OralEvent[]
  updatedAt?: string
  loading:    boolean
}

export default function OrauxPanel({ oraux, updatedAt, loading }: Props) {
  const s = SUBJECTS.oral

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            Oraux &amp; Colles
          </h2>
          {oraux.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
              style={{ background: s.bg, color: s.color }}
            >
              {oraux.length}
            </span>
          )}
        </div>
        {updatedAt && (
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
            Mis à jour {updatedAt}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: '1rem' }} />

      {loading && (
        <div className="flex items-center gap-2 py-4" style={{ color: 'var(--text-3)' }}>
          <span className="text-xs">Chargement…</span>
        </div>
      )}

      {!loading && oraux.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Aucun oral ou colle inscrit.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)', opacity: 0.6 }}>
            Inscrivez-vous sur les Google Sheets — la page se met à jour automatiquement.
          </p>
        </div>
      )}

      {!loading && oraux.length > 0 && (
        <div className="space-y-2">
          {oraux.map((o, i) => (
            <OralRow key={i} oral={o} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

function OralRow({ oral, index }: { oral: OralEvent; index: number }) {
  const s = SUBJECTS.oral

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      className="flex items-center gap-4 px-4 py-3 rounded-lg group transition-colors"
      style={{ background: '#0d0e0f', border: '1px solid var(--border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#111213')}
      onMouseLeave={e => (e.currentTarget.style.background = '#0d0e0f')}
    >
      {/* Left accent */}
      <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: s.color }} />

      {/* Date */}
      <div className="w-28 shrink-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
          {oral.date_label}
        </p>
        <p className="text-xs mt-px" style={{ color: 'var(--text-3)' }}>
          {oral.heure_start && oral.heure_end
            ? `${fmtTime(oral.heure_start)} – ${fmtTime(oral.heure_end)}`
            : oral.heure}
        </p>
      </div>

      {/* Subject + type */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
          {oral.matiere}
        </p>
        <p className="text-xs mt-px truncate" style={{ color: 'var(--text-3)' }}>
          {oral.type}
        </p>
      </div>

      {/* Meta: professor + room */}
      <div className="text-right shrink-0">
        {oral.professeur !== '—' && (
          <p className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
            {oral.professeur}
          </p>
        )}
        {oral.salle !== '—' && (
          <p className="text-xs mt-px" style={{ color: 'var(--text-3)' }}>
            Salle {oral.salle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
