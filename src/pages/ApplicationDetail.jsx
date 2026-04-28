import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getApplication, updateStatus, updateApplication, deleteApplication } from '../utils/api'
import { STATUS_META, VALID_TRANSITIONS, formatDate, daysSince, STATUSES } from '../utils/status'
import StatusBadge from '../components/StatusBadge'
import styles from './ApplicationDetail.module.css'

function HistoryItem({ item, isLast }) {
  const from = item.fromStatus ? STATUS_META[item.fromStatus] : null
  const to   = STATUS_META[item.toStatus]
  return (
    <div className={`${styles.histItem} ${isLast ? styles.histLast : ''}`}>
      <div className={styles.histDot} style={{ background: to.color }} />
      <div className={styles.histContent}>
        <div className={styles.histTransition}>
          {from ? (
            <>
              <span style={{ color: from.color }}>{from.label}</span>
              <span className={styles.histArrow}>→</span>
            </>
          ) : null}
          <span style={{ color: to.color }}>{to.label}</span>
        </div>
        {item.comment && <div className={styles.histComment}>{item.comment}</div>}
        <div className={styles.histDate}>
          {new Date(item.changedAt).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [app, setApp]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [transitioning, setTrans]   = useState(false)
  const [selectedStatus, setSelSt]  = useState('')
  const [comment, setComment]       = useState('')
  const [editing, setEditing]       = useState(false)
  const [editForm, setEditForm]     = useState({})
  const [saving, setSaving]         = useState(false)

  const load = () => {
    setLoading(true)
    getApplication(id)
      .then(data => { setApp(data); setEditForm(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleTransition = async () => {
    if (!selectedStatus) return
    setTrans(true)
    try {
      await updateStatus(id, { status: selectedStatus, comment: comment || null })
      setComment('')
      setSelSt('')
      load()
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update status')
    } finally {
      setTrans(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateApplication(id, {
        company: editForm.company,
        role:    editForm.role,
        notes:   editForm.notes,
        jobUrl:  editForm.jobUrl,
        location: editForm.location,
        salaryMin: editForm.salaryMin,
        salaryMax: editForm.salaryMax,
      })
      setEditing(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete application at ${app.company}?`)) return
    await deleteApplication(id)
    navigate('/applications')
  }

  if (loading) return <div className={styles.loading}>Loading...</div>
  if (!app)    return <div className={styles.loading}>Not found. <Link to="/applications">← Back</Link></div>

  const nextStatuses = VALID_TRANSITIONS[app.status] || []
  const days = daysSince(app.appliedAt)
  const meta = STATUS_META[app.status]

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/applications" className={styles.breadLink}>← Applications</Link>
        <span className={styles.breadSep}>/</span>
        <span className={styles.breadCurrent}>{app.company}</span>
      </div>

      <div className={styles.layout}>

        {/* Main */}
        <div className={styles.main}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <div className={styles.heroCompany}>{app.company}</div>
              <div className={styles.heroRole}>{app.role}</div>
              <div className={styles.heroMeta}>
                {app.location && <span>📍 {app.location}</span>}
                {app.salaryMin && <span>💰 MYR {app.salaryMin.toLocaleString()}–{app.salaryMax?.toLocaleString() || '?'}</span>}
                {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" className={styles.heroUrl}>🔗 Job posting ↗</a>}
              </div>
            </div>
            <div className={styles.heroRight}>
              <StatusBadge status={app.status} />
              <div className={styles.heroDays} style={{ color: days > 14 ? 'var(--rejected)' : 'var(--text-3)' }}>
                {days} days ago
              </div>
              {app.staleFlag && <div className={styles.staleWarning}>⚠ No response in 14+ days</div>}
            </div>
          </div>

          {/* Notes */}
          {!editing ? (
            <div className={styles.notesBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxTitle}>NOTES</span>
                <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit</button>
              </div>
              <div className={styles.notesText}>
                {app.notes || <span className={styles.placeholder}>No notes yet.</span>}
              </div>
            </div>
          ) : (
            <div className={styles.editBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxTitle}>EDITING</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                  <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              <div className={styles.editGrid}>
                {[
                  ['Company',  'company',  'text'],
                  ['Role',     'role',     'text'],
                  ['Location', 'location', 'text'],
                  ['Job URL',  'jobUrl',   'url'],
                  ['Salary Min (MYR)', 'salaryMin', 'number'],
                  ['Salary Max (MYR)', 'salaryMax', 'number'],
                ].map(([label, field, type]) => (
                  <label key={field} className={styles.editField}>
                    <span className={styles.editLabel}>{label}</span>
                    <input
                      type={type}
                      className={styles.editInput}
                      value={editForm[field] || ''}
                      onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
              <label className={styles.editField} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.editLabel}>Notes</span>
                <textarea
                  className={styles.editInput}
                  rows={4}
                  value={editForm.notes || ''}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                />
              </label>
            </div>
          )}

          {/* Status transition */}
          {nextStatuses.length > 0 && (
            <div className={styles.transitionBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxTitle}>UPDATE STATUS</span>
              </div>
              <div className={styles.transitionButtons}>
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    className={`${styles.transBtn} ${selectedStatus === s ? styles.transBtnActive : ''}`}
                    onClick={() => setSelSt(s === selectedStatus ? '' : s)}
                    style={selectedStatus === s ? {
                      background: STATUS_META[s].dim,
                      borderColor: STATUS_META[s].color,
                      color: STATUS_META[s].color,
                    } : {}}
                  >
                    {STATUS_META[s].icon} {STATUS_META[s].label}
                  </button>
                ))}
              </div>
              {selectedStatus && (
                <div className={styles.commentRow}>
                  <input
                    className={styles.commentInput}
                    placeholder="Add a note (optional)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button
                    className={styles.confirmBtn}
                    onClick={handleTransition}
                    disabled={transitioning}
                    style={{ background: STATUS_META[selectedStatus]?.color }}
                  >
                    {transitioning ? '...' : `→ ${STATUS_META[selectedStatus]?.label}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>

          {/* Details */}
          <div className={styles.detailBox}>
            <div className={styles.boxTitle}>DETAILS</div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Applied</span>
                <span className={styles.detailVal}>{formatDate(app.appliedAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Last updated</span>
                <span className={styles.detailVal}>{formatDate(app.updatedAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Status</span>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Stale</span>
                <span className={styles.detailVal} style={{ color: app.staleFlag ? 'var(--rejected)' : 'var(--interview)' }}>
                  {app.staleFlag ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className={styles.histBox}>
            <div className={styles.boxTitle}>HISTORY</div>
            <div className={styles.histList}>
              {(app.statusHistory || []).map((item, i) => (
                <HistoryItem
                  key={i}
                  item={item}
                  isLast={i === (app.statusHistory.length - 1)}
                />
              ))}
            </div>
          </div>

          {/* Danger */}
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete Application
          </button>
        </div>
      </div>
    </div>
  )
}
