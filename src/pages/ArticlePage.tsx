import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, User, Calendar, ThumbsUp, Share2, BookOpen } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) throw new Error('Article ID is required')
      
      const { data, error } = await supabase
        .from('content_articles')
        .select(`
          *,
          categories(name, color),
          user_profiles!content_articles_author_id_fkey(full_name, company_name, role)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Article not found')
      return data
    },
    enabled: !!id
  })

  // Increment view count
  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      if (!id) return
      
      const { error } = await supabase
        .from('content_articles')
        .update({ 
          view_count: (article?.view_count || 0) + 1 
        })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', id] })
    }
  })

  // Increment view count on mount
  useEffect(() => {
    if (article && !incrementViewMutation.isPending) {
      incrementViewMutation.mutate()
    }
  }, [article])

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/knowledge-base"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/knowledge-base"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Knowledge Base
      </Link>

      {/* Article Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-4">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-3">
            {article.categories && (
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: article.categories.color + '20',
                  color: article.categories.color 
                }}
              >
                {article.categories.name}
              </span>
            )}
            
            {article.difficulty_level && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(article.difficulty_level)}`}>
                {article.difficulty_level.charAt(0).toUpperCase() + article.difficulty_level.slice(1)}
              </span>
            )}
            
            {article.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-600">{article.excerpt}</p>
          )}

          {/* Article Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                {article.user_profiles?.full_name || 'Futuro AI Team'}
                {article.user_profiles?.company_name && (
                  <span className="ml-1">from {article.user_profiles.company_name}</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            
            {article.estimated_read_time && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{article.estimated_read_time} min read</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{article.view_count} views</span>
            </div>
            
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2" />
              <span>{article.like_count} likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Media Content */}
        {(article.image_url || article.video_url) && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Resources</h3>
            <div className="space-y-4">
              {article.image_url && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm mb-2">Image resources available</p>
                  <p className="text-blue-600 text-xs">Images and diagrams to support this article</p>
                </div>
              )}
              
              {article.video_url && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 text-sm mb-2">Video content available</p>
                  <p className="text-purple-600 text-xs">Video tutorials and demonstrations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Article Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ThumbsUp className="h-5 w-5" />
              <span>Like ({article.like_count})</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date(article.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
        <div className="text-center py-4">
          <p className="text-gray-500">Related articles coming soon...</p>
        </div>
      </div>
    </div>
  )
}