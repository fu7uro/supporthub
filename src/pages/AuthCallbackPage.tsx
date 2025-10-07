import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            navigate('/login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, redirect to app
            navigate('/')
            return
          }
        }

        // If we get here, something went wrong
        navigate('/login?error=No session found')
      } catch (error: any) {
        console.error('Auth callback error:', error)
        navigate('/login?error=' + encodeURIComponent(error.message))
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h1>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
      </div>
    </div>
  )
}