import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, Plus, Search, Filter, Clock, User, Star, TrendingUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function FeatureRequestsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [sortBy, setSortBy] = useState('star_count')
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

  // Fetch feature requests with filtering
  const { data: featureRequests, isLoading } = useQuery({
    queryKey: ['feature-requests', selectedCategory, selectedStatus, selectedPriority, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('feature_requests')
        .select(`
          *,
          categories(name, color),
          user_profiles!feature_requests_author_id_fkey(full_name, company_name, role)
        `)
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus)
      }
      
      if (selectedPriority) {
        query = query.eq('priority', selectedPriority)
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }
      
      // Sorting
      if (sortBy === 'star_count') {
        query = query.order('star_count', { ascending: false })
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'updated_at') {
        query = query.order('updated_at', { ascending: false })
      } else if (sortBy === 'priority') {
        query = query.order('priority', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })

  // Star/unstar feature request mutation
  const starMutation = useMutation({
    mutationFn: async (featureRequestId: string) => {
      if (!user) throw new Error('Must be logged in to star features')
      
      const { data, error } = await supabase.functions.invoke('feature-star-toggle', {
        body: { featureRequestId }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] })
    }
  })

  const handleStar = async (featureRequestId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Redirect to login
      return
    }
    
    try {
      await starMutation.mutateAsync(featureRequestId)
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Lightbulb className="h-8 w-8 mr-3 text-yellow-600" />
              Feature Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Propose and vote on new platform features and improvements
            </p>
          </div>
          
          {user && (
            <Link
              to="/feature-requests/new"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Feature
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
              placeholder="Search feature requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="star_count">Most Stars</option>
              <option value="created_at">Newest First</option>
              <option value="updated_at">Recently Updated</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading feature requests...</p>
          </div>
        ) : !featureRequests || featureRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feature requests found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            {user && (
              <Link
                to="/feature-requests/new"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit First Request
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {featureRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {formatStatus(request.status)}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                      </span>
                      
                      {request.categories && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: request.categories.color + '20',
                            color: request.categories.color 
                          }}
                        >
                          {request.categories.name}
                        </span>
                      )}
                      
                      {request.estimated_effort && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {request.estimated_effort} effort
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/feature-requests/${request.id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {request.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {request.description.substring(0, 200)}...
                      </p>
                    </Link>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {request.user_profiles?.full_name || 'Anonymous'}
                          {request.user_profiles?.company_name && (
                            <span className="ml-1">from {request.user_profiles.company_name}</span>
                          )}
                        </span>
                        
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Star Button */}
                  <div className="ml-6 flex flex-col items-center">
                    <button
                      onClick={(e) => handleStar(request.id, e)}
                      disabled={!user || starMutation.isPending}
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                        user ? 'hover:bg-yellow-50' : 'cursor-not-allowed opacity-50'
                      }`}
                      title={user ? 'Star this feature request' : 'Login to star'}
                    >
                      <Star 
                        className={`h-6 w-6 ${
                          starMutation.isPending ? 'animate-pulse' : ''
                        } text-yellow-500 hover:text-yellow-600`}
                        fill="currentColor"
                      />
                      <span className="text-sm font-medium text-gray-700 mt-1">
                        {request.star_count}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Results Summary */}
            <div className="p-4 text-center border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {featureRequests.length} feature request{featureRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Trending */}
      {!searchQuery && !selectedCategory && !selectedStatus && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Trending This Week</h2>
          </div>
          <p className="text-gray-600 text-sm">
            See which features the community is most excited about. Your votes help prioritize development!
          </p>
        </div>
      )}
    </div>
  )
}