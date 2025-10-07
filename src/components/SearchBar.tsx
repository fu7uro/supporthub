import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchAutocomplete } from '../lib/supabase'
import { debounce } from '../lib/utils'

interface SearchSuggestion {
  type: 'article' | 'post' | 'question' | 'feature'
  id: number
  title: string
  snippet?: string
}

const SearchBar: React.FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await searchAutocomplete(searchQuery)
      
      if (error) {
        console.error('Autocomplete error:', error)
        setSuggestions([])
      } else {
        setSuggestions(data || [])
      }
    } catch (err) {
      console.error('Autocomplete exception:', err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    if (query.trim()) {
      setLoading(true)
      debouncedSearch(query)
    } else {
      setSuggestions([])
      setLoading(false)
    }
  }, [query])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Navigate to the specific item based on type
    switch (suggestion.type) {
      case 'article':
        navigate(`/knowledge-base/${suggestion.id}`)
        break
      case 'post':
        navigate(`/forum/${suggestion.id}`)
        break
      case 'question':
        navigate(`/questions/${suggestion.id}`)
        break
      case 'feature':
        navigate(`/feature-requests/${suggestion.id}`)
        break
      default:
        // Fallback to search results
        navigate(`/search?q=${encodeURIComponent(suggestion.title)}`)
    }
    setIsOpen(false)
    setQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄'
      case 'post': return '💬'
      case 'question': return '❓'
      case 'feature': return '⭐'
      default: return '🔍'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Article'
      case 'post': return 'Forum Post'
      case 'question': return 'Question'
      case 'feature': return 'Feature Request'
      default: return 'Result'
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search knowledge base, forum, questions..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="search-loading"></div>
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="py-4 px-4 text-sm text-gray-500 text-center">
              No suggestions found. Press Enter to search.
            </div>
          )}

          {!loading && suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.id}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-start">
                <span className="text-lg mr-3 flex-shrink-0">
                  {getTypeIcon(suggestion.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </div>
                  {suggestion.snippet && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {suggestion.snippet}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {!loading && query.trim().length >= 2 && (
            <button
              onClick={handleSubmit}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">
                  Search for "<span className="font-medium">{query}</span>"
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
