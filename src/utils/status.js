export const STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

export const STATUS_META = {
  APPLIED:   { label: 'Applied',   color: 'var(--applied)',   dim: 'var(--applied-dim)',   icon: '◎' },
  SCREENING: { label: 'Screening', color: 'var(--screening)', dim: 'var(--screening-dim)', icon: '◈' },
  INTERVIEW: { label: 'Interview', color: 'var(--interview)', dim: 'var(--interview-dim)', icon: '◆' },
  OFFER:     { label: 'Offer',     color: 'var(--offer)',     dim: 'var(--offer-dim)',     icon: '★' },
  REJECTED:  { label: 'Rejected',  color: 'var(--rejected)',  dim: 'var(--rejected-dim)',  icon: '✕' },
  WITHDRAWN: { label: 'Withdrawn', color: 'var(--withdrawn)', dim: 'var(--withdrawn-dim)', icon: '◌' },
}

export const VALID_TRANSITIONS = {
  APPLIED:   ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFER',     'REJECTED', 'WITHDRAWN'],
  OFFER:     ['WITHDRAWN'],
  REJECTED:  [],
  WITHDRAWN: [],
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const daysSince = (dateStr) => {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}
