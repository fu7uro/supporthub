import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ArticlePage from './pages/ArticlePage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import QuestionsPage from './pages/QuestionsPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import FeatureRequestsPage from './pages/FeatureRequestsPage'
import FeatureRequestDetailPage from './pages/FeatureRequestDetailPage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="search-loading"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Auth pages - accessible when not logged in */}
          <Route 
            path="/login" 
            element={!session ? <LoginPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/signup" 
            element={!session ? <SignUpPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallbackPage />} 
          />

          {/* Protected routes - require authentication */}
          <Route path="/*" element={
            session ? (
              <Layout session={session}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                  <Route path="/knowledge-base/:id" element={<ArticlePage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/forum/:id" element={<ForumPostPage />} />
                  <Route path="/questions" element={<QuestionsPage />} />
                  <Route path="/questions/:id" element={<QuestionDetailPage />} />
                  <Route path="/feature-requests" element={<FeatureRequestsPage />} />
                  <Route path="/feature-requests/:id" element={<FeatureRequestDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
