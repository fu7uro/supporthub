import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search, Filter, Clock, Eye, User, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function KnowledgeBasePage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
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

  // Fetch articles with filtering
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', selectedCategory, selectedDifficulty, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('content_articles')
        .select(`
          *,
          categories(name, color)
        `)
        .eq('status', 'published')
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedDifficulty) {
        query = query.eq('difficulty_level', selectedDifficulty)
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      }
      
      // Sorting
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'view_count') {
        query = query.order('view_count', { ascending: false })
      } else if (sortBy === 'like_count') {
        query = query.order('like_count', { ascending: false })
      } else if (sortBy === 'title') {
        query = query.order('title', { ascending: true })
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
              Knowledge Base
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive documentation and guides for Futuro AI platform
            </p>
          </div>
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
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">Newest First</option>
              <option value="view_count">Most Viewed</option>
              <option value="like_count">Most Liked</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/knowledge-base/${article.id}`}
                  className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Article Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {article.featured && (
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs font-medium text-yellow-700">Featured</span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </div>

                  {/* Article Excerpt */}
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  )}

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {article.categories && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: article.categories.color + '20',
                            color: article.categories.color 
                          }}
                        >
                          {article.categories.name}
                        </span>
                      )}
                      
                      {article.difficulty_level && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty_level)}`}>
                          {article.difficulty_level}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {article.estimated_read_time && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.estimated_read_time} min
                        </span>
                      )}
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {article.view_count}
                      </span>
                    </div>
                  </div>

                  {/* Media Indicators */}
                  {(article.image_url || article.video_url) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {article.image_url && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Images
                          </span>
                        )}
                        {article.video_url && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            Video
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            
            {/* Results Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}