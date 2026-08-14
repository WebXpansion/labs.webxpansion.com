import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Full } from './pages/Full'
import { Header } from './components/Header'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<Home />} />
        <Route path="/full" element={<Full />} />
        <Route path="/full/projects/:slug" element={<Full />} />
      </Routes>
    </>
  )
}
