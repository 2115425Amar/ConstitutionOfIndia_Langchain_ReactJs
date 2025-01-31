import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Tutor from './pages/Tutor'
import Settings from './pages/Settings'
import { TutorProvider } from './context/TutorContext'

function App() {
  return (
    <TutorProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TutorProvider>
  )
}

export default App 