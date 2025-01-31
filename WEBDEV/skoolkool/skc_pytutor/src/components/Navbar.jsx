import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-comic text-primary-600">PyKids Tutor 🐍</span>
          </Link>
          
          <div className="flex space-x-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/tutor">Tutor</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link 
      to={to} 
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
    >
      {children}
    </Link>
  )
}

export default Navbar 