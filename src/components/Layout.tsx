import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  Search,
  Home,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Star,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import SearchBar from './SearchBar'

interface LayoutProps {
  children: React.ReactNode
  session: Session
}

const Layout: React.FC<LayoutProps> = ({ children, session }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      navigate('/login')
    }
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Q&A', href: '/questions', icon: HelpCircle },
    { name: 'Feature Requests', href: '/feature-requests', icon: Star },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const userInitials = session.user?.user_metadata?.full_name
    ?.split(' ')
    .map((name: string) => name.charAt(0))
    .join('')
    .toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FC</span>
              </div>
              <span className="font-semibold text-gray-900">Futuro Community</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium text-gray-700">
                    {userInitials}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">
                    {session.user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-md shadow-lg border border-gray-200">
                  <Link
                    to="/profile"
                    onClick={() => {
                      setProfileOpen(false)
                      setSidebarOpen(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => {
                      setProfileOpen(false)
                      setSidebarOpen(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block ml-4 lg:ml-0">
                <SearchBar />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search icon for mobile */}
              <Link
                to="/search"
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-6 h-6" />
              </Link>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>

              {/* User avatar */}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {userInitials}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
