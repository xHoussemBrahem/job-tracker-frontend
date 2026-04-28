import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getApplications } from '../utils/api'
import { STATUS_META, formatDate, daysSince } from '../utils/status'
import StatusBadge from '../components/StatusBadge'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './Dashboard.module.css'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={styles.statCard} style={accent ? { borderColor: `${accent}33` } : {}}>
      <div className={styles.statValue} style={accent ? { color: accent } : {}}>
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function PipelineBar({ stats }) {
  const stages = ['APPLIED','SCREENING','INTERVIEW','OFFER']
  const counts = {
    APPLIED:   stats.applied   || 0,
    SCREENING: stats.screening || 0,
    INTERVIEW: stats.interview || 0,
    OFFER:     stats.offer     || 0,
  }
  const total = Math.max(stats.total || 1, 1)

  return (
    <div className={styles.pipeline}>
      <div className={styles.pipelineHeader}>
        <span className={styles.sectionTitle}>PIPELINE</span>
        <span className={styles.pipelineSub}>{stats.total || 0} total</span>
      </div>
      <div className={styles.pipelineStages}>
        {stages.map(s => {
          const meta = STATUS_META[s]
          const pct  = Math.round((counts[s] / total) * 100)
          return (
            <div key={s} className={styles.pipelineStage}>
              <div className={styles.pipelineStageTop}>
                <span style={{ color: meta.color, fontFamily: 'var(--mono)', fontSize: 11 }}>
                  {meta.icon} {meta.label.toUpperCase()}
                </span>
                <span className={styles.pipelineCount} style={{ color: meta.color }}>
                  {counts[s]}
                </span>
              </div>
              <div className={styles.pipelineTrack}>
                <div
                  className={styles.pipelineFill}
                  style={{
                    width: `${pct}%`,
                    background: meta.color,
                    boxShadow: `0 0 8px ${meta.color}66`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [stale, setStale]   = useState([])

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
    getApplications({ size: 5 }).then(data => {
      const arr = Array.isArray(data) ? data : (data.content || [])
      setRecent(arr.slice(0, 6))
    }).catch(() => {})
    getApplications({ stale: true }).then(data => {
      const arr = Array.isArray(data) ? data : (data.content || [])
      setStale(arr.slice(0, 3))
    }).catch(() => {})
  }, [])

  if (!stats) return (
    <div className={styles.loading}>
      <span className={styles.loadingDot}>■</span>
      <span className={styles.loadingDot}>■</span>
      <span className={styles.loadingDot}>■</span>
    </div>
  )

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/add" className={styles.addBtn}>
          <span>+</span> New Application
        </Link>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Applications" value={stats.total || 0} />
        <StatCard label="Response Rate"  value={`${stats.responseRate || 0}%`}  sub="moved past applied" accent="var(--applied)" />
        <StatCard label="Interview Rate" value={`${stats.interviewRate || 0}%`} sub="of responses" accent="var(--interview)" />
        <StatCard label="Offers"         value={stats.offer     || 0} accent="var(--offer)" />
        <StatCard label="Stale"          value={stats.stale     || 0} sub="no response 14d+"  accent="var(--rejected)" />
        <StatCard label="Avg Days → Response" value={stats.avgDaysToResponse ? `${Math.round(stats.avgDaysToResponse)}d` : '—'} />
      </div>

      <div className={styles.cols}>
        {/* Pipeline */}
        <PipelineBar stats={stats} />

        {/* Recent */}
        <div className={styles.recentBox}>
          <div className={styles.pipelineHeader}>
            <span className={styles.sectionTitle}>RECENT</span>
            <Link to="/applications" className={styles.viewAll}>view all →</Link>
          </div>
          <div className={styles.recentList}>
            {recent.length === 0 && (
              <div className={styles.empty}>No applications yet. <Link to="/add">Add one →</Link></div>
            )}
            {recent.map(app => (
              <Link to={`/applications/${app.id}`} key={app.id} className={styles.recentRow}>
                <div className={styles.recentLeft}>
                  <div className={styles.recentCompany}>{app.company}</div>
                  <div className={styles.recentRole}>{app.role}</div>
                </div>
                <div className={styles.recentRight}>
                  <StatusBadge status={app.status} size="sm" />
                  <div className={styles.recentDate}>{formatDate(app.appliedAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stale alert */}
      {stale.length > 0 && (
        <div className={styles.staleBox}>
          <div className={styles.staleHeader}>
            <span className={styles.staleIcon}>⚠</span>
            <span className={styles.sectionTitle}>NEEDS FOLLOW-UP</span>
            <span className={styles.staleSub}>No response in 14+ days</span>
          </div>
          <div className={styles.staleList}>
            {stale.map(app => (
              <Link to={`/applications/${app.id}`} key={app.id} className={styles.staleRow}>
                <span className={styles.staleCompany}>{app.company}</span>
                <span className={styles.staleRole}>{app.role}</span>
                <span className={styles.staleDays}>
                  {daysSince(app.appliedAt)}d ago
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
