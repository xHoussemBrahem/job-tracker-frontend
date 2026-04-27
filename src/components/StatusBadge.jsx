import { STATUS_META } from '../utils/status'

export default function StatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status] || { label: status, color: '#888', dim: 'rgba(136,136,136,0.1)', icon: '○' }

  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'sm' ? '4px' : '6px',
    padding: size === 'sm' ? '2px 8px' : '4px 10px',
    borderRadius: '4px',
    fontSize: size === 'sm' ? '11px' : '12px',
    fontFamily: 'var(--mono)',
    fontWeight: '700',
    letterSpacing: '0.04em',
    color: meta.color,
    background: meta.dim,
    border: `1px solid ${meta.color}33`,
    whiteSpace: 'nowrap',
  }

  return (
    <span style={styles}>
      <span style={{ fontSize: size === 'sm' ? '9px' : '10px' }}>{meta.icon}</span>
      {meta.label.toUpperCase()}
    </span>
  )
}
