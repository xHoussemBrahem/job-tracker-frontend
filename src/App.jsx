import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ApplicationDetail from './pages/ApplicationDetail'
import AddApplication from './pages/AddApplication'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{
          marginLeft: 'var(--sidebar-w)',
          flex: 1,
          minHeight: '100vh',
          background: 'var(--bg)',
        }}>
          <Routes>
            <Route path="/"                      element={<Dashboard />} />
            <Route path="/applications"          element={<Applications />} />
            <Route path="/applications/:id"      element={<ApplicationDetail />} />
            <Route path="/add"                   element={<AddApplication />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
