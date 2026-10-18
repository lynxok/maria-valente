import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentService } from '../../services/contentService'
import { Lock, ArrowLeft } from 'lucide-react'

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Default master password for Maria Valente / Lynx admin
    if (password === 'maria2026' || password === 'admin') {
      contentService.setAdminAuthenticated(true)
      navigate('/admin/dashboard')
    } else {
      setError('Contraseña incorrecta. Intente nuevamente.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-lg p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a la web
          </button>
          <div className="p-2 bg-neutral-100 rounded-full">
            <Lock className="w-5 h-5 text-neutral-700" />
          </div>
        </div>

        <h2 className="text-xl font-normal text-neutral-900 tracking-wide uppercase mb-1">
          Panel de la Artista
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Ingrese su clave para gestionar obras, exposiciones, intervenciones y CV.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xs text-sm focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest transition-colors rounded-xs cursor-pointer"
          >
            Ingresar al Panel
          </button>
        </form>

        <p className="text-[11px] text-neutral-400 text-center mt-6">
          Acceso protegido exclusivo para María Valente
        </p>
      </div>
    </div>
  )
}
