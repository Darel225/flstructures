import { useReservationModalStore } from '../store/reservationModalStore'

export const useHebergementModal = () => {
  const isOpen = useReservationModalStore((state) => state.isOpen)
  const residence = useReservationModalStore((state) => state.residence)
  const openReservationModal = useReservationModalStore((state) => state.openReservationModal)
  const closeReservationModal = useReservationModalStore((state) => state.closeReservationModal)

  return {
    isOpen,
    residence,
    openModal: (data) => openReservationModal(data),
    closeModal: () => closeReservationModal(),
    openReservationModal,
    closeReservationModal,
  }
}

export default useHebergementModal
