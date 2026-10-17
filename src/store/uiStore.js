import { create } from 'zustand'

/**
 * @typedef {Object} UIState
 * @property {boolean} isSidebarCollapsed - État rétracté/déplié de la barre latérale sur desktop
 * @property {boolean} isMobileSidebarOpen - État ouvert/fermé du menu tiroir sur mobile
 * @property {() => void} toggleSidebar - Alterne l'état rétracté de la barre latérale
 * @property {(collapsed: boolean) => void} setSidebarCollapsed - Force l'état de rétraction
 * @property {() => void} toggleMobileSidebar - Alterne l'ouverture du tiroir mobile
 * @property {(open: boolean) => void} setMobileSidebarOpen - Force l'état d'ouverture mobile
 */

/**
 * Store Zustand pour la gestion de l'interface utilisateur du Back-Office.
 */
export const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    })),

  setSidebarCollapsed: (collapsed) =>
    set({
      isSidebarCollapsed: collapsed,
    }),

  toggleMobileSidebar: () =>
    set((state) => ({
      isMobileSidebarOpen: !state.isMobileSidebarOpen,
    })),

  setMobileSidebarOpen: (open) =>
    set({
      isMobileSidebarOpen: open,
    }),
}))

export default useUIStore
