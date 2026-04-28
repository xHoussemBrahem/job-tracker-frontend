import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createApplication } from '../utils/api'
import styles from './AddApplication.module.css'

const FIELDS = [
  { key: 'company',   label: 'Company',        type: 'text',   required: true,  placeholder: 'e.g. Grab, EPAM, DHL' },
  { key: 'role',      label: 'Role / Title',   type: 'text',   required: true,  placeholder: 'e.g. Backend Engineer' },
  { key: 'appliedAt', label: 'Date Applied',   type: 'date',   required: true,  placeholder: '' },
  { key: 'location',  label: 'Location',       type: 'text',   required: false, placeholder: 'e.g. Kuala Lumpur' },
  { key: 'jobUrl',    label: 'Job Posting URL',type: 'url',    required: false, placeholder: 'https://...' },
  { key: 'salaryMin', label: 'Salary Min (MYR)',type: 'number',required: false, placeholder: '5000' },
  { key: 'salaryMax', label: 'Salary Max (MYR)',type: 'number',required: false, placeholder: '9000' },
]

export default function AddApplication() {
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ appliedAt: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company || !form.role || !form.appliedAt) {
      setError('Company, role, and date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
      }
      const created = await createApplication(payload)
      navigate(`/applications/${created.id}`)
    } catch (e) {
      const detail = e.response?.data?.detail || e.response?.data?.errors
      setError(typeof detail === 'object' ? JSON.stringify(detail) : (detail || 'Failed to create.'))
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/applications" className={styles.back}>← Applications</Link>
        <h1 className={styles.title}>New Application</h1>
        <p className={styles.sub}>Track a new job application</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {FIELDS.map(f => (
            <label key={f.key} className={styles.field}>
              <span className={styles.label}>
                {f.label}
                {f.required && <span className={styles.req}>*</span>}
              </span>
              <input
                type={f.type}
                className={styles.input}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                required={f.required}
              />
            </label>
          ))}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Notes</span>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Recruiter contact, referral source, key requirements, salary expectations..."
            value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Link to="/applications" className={styles.cancelBtn}>Cancel</Link>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Creating...' : 'Create Application'}
          </button>
        </div>
      </form>
    </div>
  )
}
