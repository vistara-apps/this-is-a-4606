import React from 'react'
import { Bell, Settings, User } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-dark-surface/50 backdrop-blur-lg border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
              <h1 className="text-xl font-bold text-white">TikTokFlow</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
    </header>
  )
}

export default Header