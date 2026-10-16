import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import PagePlaceholder from './pages/PagePlaceholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PagePlaceholder title="Reserva tu estancia perfecta en Hotel Aurora" />} />
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
