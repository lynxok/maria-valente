import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar, NavbarMobile } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { GalleryPage } from './pages/GalleryPage'
import { CVPage } from './pages/CVPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { contentService } from './services/contentService'

// Layout with persistent Sidebar for public views
const PublicLayout: React.FC = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative">
      <NavbarMobile />
      
      {/* 
        En la Home: la sidebar flota sobre la imagen a sangre completa con degradado sutil.
        En páginas internas: sidebar sticky a toda la altura (top-0 h-screen).
      */}
      <div className={isHome ? 'md:absolute md:top-0 md:left-0 md:bottom-0 md:z-30 pointer-events-auto' : 'md:sticky md:top-0 md:h-screen md:shrink-0'}>
        <Sidebar isTransparent={isHome} />
      </div>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

// Protected route wrapper for Admin Panel
const ProtectedAdminRoute: React.FC = () => {
  const isAuth = contentService.isAdminAuthenticated()
  if (!isAuth) {
    return <Navigate to="/admin" replace />
  }
  return <AdminDashboardPage />
}

export function App() {
  React.useEffect(() => {
    contentService.syncFromSupabase()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* Dynamic Gallery routes for Obras, Intervenciones, Exposiciones */}
          <Route path="/:sectionSlug/:categorySlug" element={<GalleryPage />} />

          {/* CV & Biography Routes */}
          <Route path="/cv" element={<Navigate to="/cv/biografia" replace />} />
          <Route path="/cv/:subpage" element={<CVPage />} />
        </Route>

        {/* Admin Login & Panel Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
