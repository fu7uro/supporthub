import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Plus, Search, Filter, Clock, Eye, CheckCircle, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function QuestionsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (error) throw error
      return data
    }
  })

  // Fetch questions with filtering
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', selectedCategory, selectedStatus, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select(`
          *,
          categories(name, color),
          user_profiles!questions_author_id_fkey(full_name, company_name)
        `)
        .neq('status', 'deleted')
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus)
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }
      
      // Sorting
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'view_count') {
        query = query.order('view_count', { ascending: false })
      } else if (sortBy === 'answer_count') {
        query = query.order('answer_count', { ascending: false })
      } else if (sortBy === 'bounty_points') {
        query = query.order('bounty_points', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })

  const getStatusColor = (status: string, hasAcceptedAnswer: boolean) => {
    if (hasAcceptedAnswer) {
      return 'bg-green-100 text-green-800'
    }
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string, hasAcceptedAnswer: boolean) => {
    if (hasAcceptedAnswer) {
      return 'Answered'
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-8 w-8 mr-3 text-green-600" />
              Community Questions
            </h1>
            <p className="text-gray-600 mt-2">
              Ask questions and get answers from experts and community members
            </p>
          </div>
          
          {user && (
            <Link
              to="/questions/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="created_at">Newest First</option>
              <option value="view_count">Most Viewed</option>
              <option value="answer_count">Most Answers</option>
              <option value="bounty_points">Highest Bounty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading questions...</p>
          </div>
        ) : !questions || questions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            {user && (
              <Link
                to="/questions/new"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ask the First Question
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status, question.has_accepted_answer)}`}>
                        {question.has_accepted_answer && (
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                        )}
                        {getStatusText(question.status, question.has_accepted_answer)}
                      </span>
                      
                      {question.categories && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: question.categories.color + '20',
                            color: question.categories.color 
                          }}
                        >
                          {question.categories.name}
                        </span>
                      )}
                      
                      {question.bounty_points > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {question.bounty_points} pts bounty
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {question.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {question.content.substring(0, 200)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {question.user_profiles?.full_name || 'Anonymous'}
                      {question.user_profiles?.company_name && (
                        <span className="ml-1">from {question.user_profiles.company_name}</span>
                      )}
                    </span>
                    
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {question.view_count} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Results Summary */}
            <div className="p-4 text-center border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}