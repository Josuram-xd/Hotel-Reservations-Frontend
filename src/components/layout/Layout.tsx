import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
