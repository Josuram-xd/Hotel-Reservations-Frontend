import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import PagePlaceholder from './pages/PagePlaceholder'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="buscar" element={<PagePlaceholder title="Busca tu habitación" />} />
        <Route path="reserva/:id" element={<PagePlaceholder title="Tu reserva" />} />
        <Route path="factura/:id" element={<PagePlaceholder title="Tu factura" />} />
        <Route
          path="*"
          element={<PagePlaceholder title="Página no encontrada" description="La página que buscas no existe." />}
        />
      </Route>
    </Routes>
  )
}
