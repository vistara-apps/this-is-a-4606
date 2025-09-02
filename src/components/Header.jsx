import React from 'react'
import { Bell, Settings, User, Menu, X } from 'lucide-react'

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen, activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'shipping', label: 'Shipping' }
  ]

  const handleLogoClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-dark-surface/50 backdrop-blur-lg border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
              <h1 className="text-xl font-bold text-white">TikTokFlow</h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button 
              className="sm:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors">
              <Settings size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-dark-surface/95 backdrop-blur-lg border-b border-dark-border">
          <nav className="px-4 py-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-card'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header