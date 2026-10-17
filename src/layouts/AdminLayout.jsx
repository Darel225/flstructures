import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/layout/AdminSidebar'
import AdminTopbar from '../components/admin/layout/AdminTopbar'

/**
 * Layout principal de l'espace d'administration de FL Structures.
 * Fournit une structure à deux panneaux avec barre latérale rétractable et zone de travail fluide.
 */
export default function AdminLayout() {
  return (
    <div className="fl-admin-scope min-h-screen bg-[#F8F6F4] text-[#111111] flex font-sans antialiased">
      {/* 1. Barre latérale d'administration */}
      <AdminSidebar />

      {/* 2. Zone de travail principale */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8F6F4]">
        {/* Barre supérieure d'en-tête */}
        <AdminTopbar />

        {/* Zone de contenu défilante avec grille et respiration généreuse */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#F8F6F4]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
