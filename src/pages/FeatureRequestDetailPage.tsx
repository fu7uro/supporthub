import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, User, Calendar, Star, Award, MessageCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function FeatureRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch feature request with comments
  const { data: featureRequest, isLoading, error } = useQuery({
    queryKey: ['feature-request', id],
    queryFn: async () => {
      if (!id) throw new Error('Feature request ID is required')
      
      const { data, error } = await supabase
        .from('feature_requests')
        .select(`
          *,
          categories(name, color),
          user_profiles!feature_requests_author_id_fkey(full_name, company_name, role)
        `)
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Feature request not found')
      return data
    },
    enabled: !!id
  })

  // Fetch comments for this feature request
  const { data: comments } = useQuery({
    queryKey: ['feature-comments', id],
    queryFn: async () => {
      if (!id) return []
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!comments_author_id_fkey(full_name, company_name, role)
        `)
        .eq('content_type', 'feature_request')
        .eq('content_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  // Star/unstar feature request mutation
  const starMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to star features')
      if (!id) throw new Error('Feature request ID is required')
      
      const { data, error } = await supabase.functions.invoke('feature-star-toggle', {
        body: { featureRequestId: id }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-request', id] })
    }
  })

  const handleStar = async () => {
    if (!user) {
      // Redirect to login
      return
    }
    
    try {
      await starMutation.mutateAsync()
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

  if (error || !featureRequest) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Request Not Found</h1>
          <p className="text-gray-600 mb-4">
            The feature request you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/feature-requests"
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feature Requests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/feature-requests"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feature Requests
      </Link>

      {/* Feature Request */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Feature Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(featureRequest.status)}`}>
              {formatStatus(featureRequest.status)}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(featureRequest.priority)}`}>
              {featureRequest.priority.charAt(0).toUpperCase() + featureRequest.priority.slice(1)} Priority
            </span>
            
            {featureRequest.categories && (
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: featureRequest.categories.color + '20',
                  color: featureRequest.categories.color 
                }}
              >
                {featureRequest.categories.name}
              </span>
            )}
            
            {featureRequest.estimated_effort && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {featureRequest.estimated_effort} effort
              </span>
            )}
          </div>

          {/* Title and Star Button */}
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{featureRequest.title}</h1>
            
            <button
              onClick={handleStar}
              disabled={!user || starMutation.isPending}
              className={`ml-6 flex flex-col items-center p-3 rounded-lg border transition-colors ${
                user 
                  ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400' 
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
              title={user ? 'Star this feature request' : 'Login to star'}
            >
              <Star 
                className={`h-8 w-8 ${
                  starMutation.isPending ? 'animate-pulse' : ''
                } text-yellow-500 hover:text-yellow-600`}
                fill="currentColor"
              />
              <span className="text-lg font-bold text-gray-900 mt-1">
                {featureRequest.star_count}
              </span>
              <span className="text-xs text-gray-600">stars</span>
            </button>
          </div>

          {/* Author and Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                {featureRequest.user_profiles?.full_name || 'Anonymous'}
                {featureRequest.user_profiles?.company_name && (
                  <span className="ml-1">from {featureRequest.user_profiles.company_name}</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(featureRequest.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Feature Description */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>
              {featureRequest.description}
            </ReactMarkdown>
          </div>

          {/* Implementation Notes */}
          {featureRequest.implementation_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Implementation Notes</h3>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>
                  {featureRequest.implementation_notes}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
            Last updated: {new Date(featureRequest.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Discussion ({comments?.length || 0})
          </h2>
        </div>

        {comments && comments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="space-y-4">
                  {/* Comment Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {comment.user_profiles?.full_name || 'Anonymous'}
                          {comment.user_profiles?.company_name && (
                            <span className="ml-1">from {comment.user_profiles.company_name}</span>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {comment.is_edited && (
                      <span className="text-xs text-gray-500">Edited</span>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="prose max-w-none">
                    <ReactMarkdown>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500 mb-4">Be the first to discuss this feature request.</p>
          </div>
        )}
      </div>

      {/* Comment Form Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add to Discussion</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Comment form coming soon...</p>
        </div>
      </div>
    </div>
  )
}