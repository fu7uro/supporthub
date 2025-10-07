import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Search, Filter, Clock, Eye, MessageCircle, Pin, Lock, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function ForumPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('last_activity_at')
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

  // Fetch forum posts with filtering
  const { data: posts, isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory, selectedType, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          categories(name, color),
          user_profiles!forum_posts_author_id_fkey(full_name, company_name, role)
        `)
        .eq('status', 'active')
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedType) {
        query = query.eq('post_type', selectedType)
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }
      
      // Sorting with pinned posts first
      if (sortBy === 'last_activity_at') {
        query = query.order('is_pinned', { ascending: false })
                    .order('last_activity_at', { ascending: false })
      } else if (sortBy === 'created_at') {
        query = query.order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false })
      } else if (sortBy === 'view_count') {
        query = query.order('is_pinned', { ascending: false })
                    .order('view_count', { ascending: false })
      } else if (sortBy === 'reply_count') {
        query = query.order('is_pinned', { ascending: false })
                    .order('reply_count', { ascending: false })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-red-100 text-red-800'
      case 'discussion': return 'bg-blue-100 text-blue-800'
      case 'question': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPostTypeText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-purple-600" />
              Community Forum
            </h1>
            <p className="text-gray-600 mt-2">
              Join discussions about AI technology, share experiences, and connect with the community
            </p>
          </div>
          
          {user && (
            <Link
              to="/forum/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
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
              placeholder="Search forum posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Types</option>
              <option value="announcement">Announcements</option>
              <option value="discussion">Discussions</option>
              <option value="question">Questions</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="last_activity_at">Recent Activity</option>
              <option value="created_at">Newest First</option>
              <option value="view_count">Most Viewed</option>
              <option value="reply_count">Most Replies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forum Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            {user && (
              <Link
                to="/forum/new"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start the Conversation
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-3">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.is_pinned && (
                          <Pin className="h-4 w-4 text-red-500" />
                        )}
                        
                        {post.is_locked && (
                          <Lock className="h-4 w-4 text-gray-500" />
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}>
                          {getPostTypeText(post.post_type)}
                        </span>
                        
                        {post.categories && (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: post.categories.color + '20',
                              color: post.categories.color 
                            }}
                          >
                            {post.categories.name}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.content.substring(0, 200)}...
                      </p>
                    </div>
                  </div>

                  {/* Post Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.user_profiles?.full_name || 'Anonymous'}
                        {post.user_profiles?.company_name && (
                          <span className="ml-1">from {post.user_profiles.company_name}</span>
                        )}
                      </span>
                      
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(post.last_activity_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.reply_count} replies
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.view_count} views
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Results Summary */}
            <div className="p-4 text-center border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {posts.length} post{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}