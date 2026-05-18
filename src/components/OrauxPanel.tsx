'use client'
import { motion } from 'framer-motion'
import type { OralEvent } from '@/lib/types'
import { fmtTime } from '@/lib/utils'

interface Props {
  oraux:      OralEvent[]
  updatedAt?: string
  loading:    boolean
}

export default function OrauxPanel({ oraux, updatedAt, loading }: Props) {
  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Oraux &amp; Colles
          </h2>
          {oraux.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold"
              style={{
                background: 'var(--accent-sub)',
                color: 'var(--accent-2)',
                border: '1px solid var(--accent-border)',
              }}
            >
              {oraux.length}
            </span>
          )}
        </div>
        {updatedAt && (
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
            {updatedAt}
          </span>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.25rem' }} />

      {loading && (
        <p className="text-[12px] py-2" style={{ color: 'var(--text-3)' }}>Chargement…</p>
      )}

      {!loading && oraux.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Aucun oral inscrit.</p>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-3)', opacity: 0.5 }}>
            Mise à jour automatique toutes les 10 min.
          </p>
        </div>
      )}

      {!loading && oraux.length > 0 && (
        <div>
          {oraux.map((o, i) => (
            <OralRow key={i} oral={o} index={i} last={i === oraux.length - 1} />
          ))}
        </div>
      )}
    </section>
  )
}

function OralRow({ oral, index, last }: { oral: OralEvent; index: number; last: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
    >
      <div
        className="flex items-center gap-5 px-4 py-3 rounded-lg transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          className="w-px self-stretch rounded-full shrink-0"
          style={{ background: 'var(--accent)', opacity: 0.5, minHeight: 32 }}
        />

        <div className="w-28 shrink-0">
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-1)' }}>
            {oral.date_label}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            {oral.heure_start && oral.heure_end
              ? `${fmtTime(oral.heure_start)} – ${fmtTime(oral.heure_end)}`
              : oral.heure}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-1)' }}>
            {oral.matiere}
          </p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
            {oral.type}
          </p>
        </div>

        <div className="text-right shrink-0">
          {oral.professeur !== '—' && (
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>
              {oral.professeur}
            </p>
          )}
          {oral.salle !== '—' && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              {oral.salle}
            </p>
          )}
        </div>
      </div>

      {!last && (
        <div style={{ height: 1, background: 'var(--border)', margin: '0 1rem' }} />
      )}
    </motion.div>
  )
}
