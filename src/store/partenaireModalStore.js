import { create } from 'zustand'

export const usePartenaireModalStore = create((set) => ({
  isOpen: false,
  initialData: {},
  openPartenaireModal: (initialData = {}) => set({ isOpen: true, initialData }),
  closePartenaireModal: () => set({ isOpen: false, initialData: {} }),
}))

export const usePartenaireModal = () => {
  const isOpen = usePartenaireModalStore((state) => state.isOpen)
  const initialData = usePartenaireModalStore((state) => state.initialData)
  const openPartenaireModal = usePartenaireModalStore((state) => state.openPartenaireModal)
  const closePartenaireModal = usePartenaireModalStore((state) => state.closePartenaireModal)

  return { isOpen, initialData, openPartenaireModal, closePartenaireModal }
}

export default usePartenaireModalStore
