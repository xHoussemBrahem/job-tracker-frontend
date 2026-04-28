import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getApplications, deleteApplication } from '../utils/api'
import { STATUSES, STATUS_META, formatDate, daysSince } from '../utils/status'
import StatusBadge from '../components/StatusBadge'
import styles from './Applications.module.css'

const SORT_OPTIONS = [
  { value: 'appliedAt_desc', label: 'Newest first' },
  { value: 'appliedAt_asc',  label: 'Oldest first' },
  { value: 'company_asc',    label: 'Company A→Z' },
]

export default function Applications() {
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')       // status filter
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState('appliedAt_desc')
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter) params.status = filter
    if (search) params.company = search
    getApplications(params)
      .then(data => setApps(Array.isArray(data) ? data : (data.content || [])))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, search])

  const sorted = [...apps].sort((a, b) => {
    if (sort === 'appliedAt_desc') return new Date(b.appliedAt) - new Date(a.appliedAt)
    if (sort === 'appliedAt_asc')  return new Date(a.appliedAt) - new Date(b.appliedAt)
    if (sort === 'company_asc')    return a.company.localeCompare(b.company)
    return 0
  })

  const handleDelete = async (id, e) => {
    e.preventDefault()
    if (!window.confirm('Delete this application?')) return
    setDeleting(id)
    await deleteApplication(id).catch(() => {})
    setDeleting(null)
    load()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Applications</h1>
          <p className={styles.sub}>{apps.length} total</p>
        </div>
        <Link to="/add" className={styles.addBtn}>+ New</Link>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === '' ? styles.active : ''}`}
            onClick={() => setFilter('')}
          >All</button>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
              onClick={() => setFilter(s)}
              style={filter === s ? {
                color: STATUS_META[s].color,
                background: STATUS_META[s].dim,
                borderColor: `${STATUS_META[s].color}44`,
              } : {}}
            >
              {STATUS_META[s].icon} {STATUS_META[s].label}
            </button>
          ))}
        </div>
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : sorted.length === 0 ? (
        <div className={styles.empty}>
          No applications found. <Link to="/add">Add one →</Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(app => (
                <tr
                  key={app.id}
                  className={`${styles.row} ${app.staleFlag ? styles.stale : ''}`}
                >
                  <td>
                    <Link to={`/applications/${app.id}`} className={styles.companyLink}>
                      <span className={styles.company}>{app.company}</span>
                      {app.staleFlag && <span className={styles.staleTag}>stale</span>}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/applications/${app.id}`} className={styles.role}>
                      {app.role}
                    </Link>
                  </td>
                  <td className={styles.loc}>{app.location || '—'}</td>
                  <td><StatusBadge status={app.status} size="sm" /></td>
                  <td className={styles.mono}>{formatDate(app.appliedAt)}</td>
                  <td className={styles.age}>
                    <span style={{
                      color: daysSince(app.appliedAt) > 14 ? 'var(--rejected)' : 'var(--text-3)'
                    }}>
                      {daysSince(app.appliedAt)}d
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link to={`/applications/${app.id}`} className={styles.actionBtn}>
                        View
                      </Link>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={(e) => handleDelete(app.id, e)}
                        disabled={deleting === app.id}
                      >
                        {deleting === app.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
