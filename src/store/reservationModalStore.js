import { create } from 'zustand'

export const useReservationModalStore = create((set) => ({
  isOpen: false,
  residence: '',
  initialData: {},
  openReservationModal: (data = {}) => {
    const residenceName =
      typeof data === 'string'
        ? data
        : data?.residence ||
          data?.defaultResidence ||
          data?.residenceNom ||
          data?.nom ||
          data?.title ||
          ''
    const initial = typeof data === 'object' ? data : { residence: residenceName }
    set({
      isOpen: true,
      residence: residenceName,
      initialData: initial,
    })
  },
  openModal: (data = {}) => {
    const residenceName =
      typeof data === 'string'
        ? data
        : data?.residence ||
          data?.defaultResidence ||
          data?.residenceNom ||
          data?.nom ||
          data?.title ||
          ''
    const initial = typeof data === 'object' ? data : { residence: residenceName }
    set({
      isOpen: true,
      residence: residenceName,
      initialData: initial,
    })
  },
  closeReservationModal: () => set({ isOpen: false, residence: '', initialData: {} }),
  closeModal: () => set({ isOpen: false, residence: '', initialData: {} }),
}))

export const useReservationModal = () => {
  const isOpen = useReservationModalStore((state) => state.isOpen)
  const residence = useReservationModalStore((state) => state.residence)
  const initialData = useReservationModalStore((state) => state.initialData)
  const openReservationModal = useReservationModalStore((state) => state.openReservationModal)
  const closeReservationModal = useReservationModalStore((state) => state.closeReservationModal)

  return {
    isOpen,
    residence,
    initialData,
    openReservationModal,
    openModal: openReservationModal,
    closeReservationModal,
    closeModal: closeReservationModal,
  }
}

export default useReservationModalStore
