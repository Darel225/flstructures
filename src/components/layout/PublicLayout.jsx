import { Outlet } from 'react-router-dom'
import Navbar from '../public/Navbar'
import Footer from '../public/Footer'
import { DevisModalProvider } from '../../context/DevisModalContext'
import DevisRequestModal from '../public/DevisRequestModal'
import PartenaireRequestModal from '../public/PartenaireRequestModal'
import ReservationStayModal from '../public/ReservationStayModal'

export default function PublicLayout() {
  return (
    <DevisModalProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="grow">
          <Outlet />
        </main>
        <Footer />
        <DevisRequestModal />
        <PartenaireRequestModal />
        <ReservationStayModal />
      </div>
    </DevisModalProvider>
  )
}

