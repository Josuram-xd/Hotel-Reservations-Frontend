import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import Login from './pages/Login'
import PagePlaceholder from './pages/PagePlaceholder'
import Register from './pages/Register'
import ReservationPage from './pages/ReservationPage'
import Search from './pages/Search'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="buscar" element={<Search />} />
        <Route element={<ProtectedRoute />}>
          <Route path="mis-reservas" element={<PagePlaceholder title="Mis reservas" />} />
          <Route path="reservar" element={<Booking />} />
          <Route path="reserva/:id" element={<ReservationPage />} />
          <Route path="factura/:id" element={<PagePlaceholder title="Tu factura" />} />
        </Route>
        <Route
          path="*"
          element={<PagePlaceholder title="Página no encontrada" description="La página que buscas no existe." />}
        />
      </Route>
    </Routes>
  )
}
