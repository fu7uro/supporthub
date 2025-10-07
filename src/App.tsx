import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ArticlePage from './pages/ArticlePage'
import QuestionsPage from './pages/QuestionsPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import FeatureRequestsPage from './pages/FeatureRequestsPage'
import FeatureRequestDetailPage from './pages/FeatureRequestDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminPage from './pages/AdminPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/knowledge-base/:id" element={<ArticlePage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:id" element={<ForumPostPage />} />
              <Route path="/feature-requests" element={<FeatureRequestsPage />} />
              <Route path="/feature-requests/:id" element={<FeatureRequestDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App