import { create } from 'zustand'

export const useDevisModalStore = create((set) => ({
  isOpen: false,
  initialData: {},
  openDevisModal: (initialData = {}) => set({ isOpen: true, initialData }),
  openModal: (initialData = {}) => set({ isOpen: true, initialData }),
  closeDevisModal: () => set({ isOpen: false, initialData: {} }),
  closeModal: () => set({ isOpen: false, initialData: {} }),
}))

export const useDevisModal = () => {
  const isOpen = useDevisModalStore((state) => state.isOpen)
  const initialData = useDevisModalStore((state) => state.initialData)
  const openDevisModal = useDevisModalStore((state) => state.openDevisModal)
  const closeDevisModal = useDevisModalStore((state) => state.closeDevisModal)

  return {
    isOpen,
    initialData,
    openDevisModal,
    openModal: openDevisModal,
    closeDevisModal,
    closeModal: closeDevisModal,
  }
}

export default useDevisModalStore
