import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Filter, BookOpen, MessageCircle, Users, Lightbulb, Clock, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase, SearchResult } from '../lib/supabase'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['articles', 'questions', 'forum_posts', 'feature_requests'])
  const [selectedCategory, setSelectedCategory] = useState('')

  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  // Fetch categories for filtering
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

  // Search function
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['search', query, selectedTypes, selectedCategory],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const { data, error } = await supabase.functions.invoke('enhanced-search', {
        body: {
          query: query.trim(),
          contentTypes: selectedTypes,
          categoryId: selectedCategory || null,
          limit: 50
        }
      })

      if (error) throw error
      return data?.data?.results || []
    },
    enabled: !!query.trim()
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const handleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return BookOpen
      case 'question': return MessageCircle
      case 'forum_post': return Users
      case 'feature_request': return Lightbulb
      default: return BookOpen
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800'
      case 'question': return 'bg-green-100 text-green-800'
      case 'forum_post': return 'bg-purple-100 text-purple-800'
      case 'feature_request': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContentLink = (result: SearchResult) => {
    switch (result.content_type) {
      case 'article': return `/knowledge-base/${result.id}`
      case 'question': return `/questions/${result.id}`
      case 'forum_post': return `/forum/${result.id}`
      case 'feature_request': return `/feature-requests/${result.id}`
      default: return '#'
    }
  }

  const formatContentType = (type: string) => {
    switch (type) {
      case 'article': return 'Knowledge Base'
      case 'question': return 'Question'
      case 'forum_post': return 'Forum Post'
      case 'feature_request': return 'Feature Request'
      default: return type
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Community</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search knowledge base, questions, forum posts, and feature requests..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by content type:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'articles', label: 'Knowledge Base', icon: BookOpen },
              { key: 'questions', label: 'Questions', icon: MessageCircle },
              { key: 'forum_posts', label: 'Forum Posts', icon: Users },
              { key: 'feature_requests', label: 'Feature Requests', icon: Lightbulb }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTypeFilter(key)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTypes.includes(key)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Category:</span>
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
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {query.trim() ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results for "{query}"
              </h2>
              {searchResults && (
                <span className="text-sm text-gray-500">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {searchLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : searchError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error searching: {searchError.message}</p>
              </div>
            ) : !searchResults || searchResults.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
                
                {/* Suggest posting a question */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 mb-2">Didn't find what you're looking for?</p>
                  <Link
                    to="/questions"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => {
                  const Icon = getContentTypeIcon(result.content_type)
                  return (
                    <Link
                      key={`${result.content_type}-${result.id}`}
                      to={getContentLink(result)}
                      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(result.content_type)}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {formatContentType(result.content_type)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {result.view_count}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{result.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{result.description}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-500">Enter keywords to search across our knowledge base, community discussions, and more.</p>
          </div>
        )}
      </div>
    </div>
  )
}