import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: '▦' },
  { to: '/applications',label: 'Applications', icon: '≡' },
  { to: '/add',         label: 'Add Job',      icon: '+' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>◈</span>
        <div>
          <div className={styles.brandTitle}>JobTracker</div>
          <div className={styles.brandSub}>MY · 2026</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.linkIcon}>{item.icon}</span>
            <span className={styles.linkLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerLabel}>Target Market</div>
        <div className={styles.footerValue}>🇲🇾 Malaysia</div>
      </div>
    </aside>
  )
}
