import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, MessageCircle, Users, Lightbulb, TrendingUp, Clock, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  // Fetch recent articles
  const { data: recentArticles } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data
    }
  })

  // Fetch recent questions
  const { data: recentQuestions } = useQuery({
    queryKey: ['recent-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data
    }
  })

  // Fetch top feature requests
  const { data: topFeatures } = useQuery({
    queryKey: ['top-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('star_count', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data
    }
  })

  const features = [
    {
      title: 'Knowledge Base',
      description: 'Comprehensive documentation and guides for Futuro AI platform',
      icon: BookOpen,
      link: '/knowledge-base',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Q&A Community', 
      description: 'Ask questions and get answers from experts and community',
      icon: MessageCircle,
      link: '/questions',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Forum Discussions',
      description: 'Join conversations about AI technology and best practices',
      icon: Users,
      link: '/forum',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Feature Requests',
      description: 'Propose and vote on new platform features and improvements',
      icon: Lightbulb,
      link: '/feature-requests',
      color: 'bg-yellow-100 text-yellow-800'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Welcome to the
            <span className="text-blue-600"> Futuro AI </span>
            Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your central hub for everything related to Futuro Corporation's revolutionary 
            conversational AI technology. Get support, share knowledge, and connect with our community.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600">Human-indistinguishable AI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">24h</div>
              <div className="text-sm text-gray-600">Implementation guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-600">Platform integrations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              to={feature.link}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Latest Articles
            </h2>
            <Link to="/knowledge-base" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentArticles?.map((article) => (
              <Link
                key={article.id}
                to={`/knowledge-base/${article.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {article.estimated_read_time} min read
                </div>
              </Link>
            )) || (
              <div className="text-center text-gray-500 py-4">
                <p>No articles yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              Recent Questions
            </h2>
            <Link to="/questions" className="text-green-600 hover:text-green-800 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentQuestions?.map((question) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{question.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{question.answer_count} answers</span>
                  <span>{question.view_count} views</span>
                </div>
              </Link>
            )) || (
              <div className="text-center text-gray-500 py-4">
                <p>No questions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Feature Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-yellow-600" />
              Popular Requests
            </h2>
            <Link to="/feature-requests" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {topFeatures?.map((feature) => (
              <Link
                key={feature.id}
                to={`/feature-requests/${feature.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{feature.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                    {feature.star_count} stars
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    feature.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    feature.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    feature.status === 'planned' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feature.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            )) || (
              <div className="text-center text-gray-500 py-4">
                <p>No feature requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Join our community of AI enthusiasts and business professionals. 
          Ask questions, share knowledge, and help shape the future of conversational AI.
        </p>
        <div className="space-x-4">
          <Link
            to="/questions"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            Ask a Question
          </Link>
          <Link
            to="/knowledge-base"
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors inline-block"
          >
            Browse Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  )
}