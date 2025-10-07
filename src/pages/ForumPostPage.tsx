import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, User, Calendar, Eye, MessageCircle, Pin, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>()

  // Fetch forum post with comments
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: async () => {
      if (!id) throw new Error('Post ID is required')
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          categories(name, color),
          user_profiles!forum_posts_author_id_fkey(full_name, company_name, role)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Post not found')
      return data
    },
    enabled: !!id
  })

  // Fetch comments for this post
  const { data: comments } = useQuery({
    queryKey: ['forum-comments', id],
    queryFn: async () => {
      if (!id) return []
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!comments_author_id_fkey(full_name, company_name, role)
        `)
        .eq('content_type', 'forum_post')
        .eq('content_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!id
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

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">
            The forum post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/forum"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/forum"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Forum
      </Link>

      {/* Forum Post */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-3">
            {post.is_pinned && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </span>
            )}
            
            {post.is_locked && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </span>
            )}
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.post_type)}`}>
              {getPostTypeText(post.post_type)}
            </span>
            
            {post.categories && (
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: post.categories.color + '20',
                  color: post.categories.color 
                }}
              >
                {post.categories.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>

          {/* Author and Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                {post.user_profiles?.full_name || 'Anonymous'}
                {post.user_profiles?.company_name && (
                  <span className="ml-1">from {post.user_profiles.company_name}</span>
                )}
                {post.user_profiles?.role === 'admin' && (
                  <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Admin</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{post.view_count} views</span>
            </div>
            
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>{post.reply_count} replies</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Last Activity */}
          <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
            Last activity: {new Date(post.last_activity_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {comments?.length || 0} Comment{comments?.length !== 1 ? 's' : ''}
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
            <p className="text-gray-500 mb-4">Be the first to comment on this post.</p>
          </div>
        )}
      </div>

      {/* Comment Form Placeholder */}
      {!post.is_locked && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Comment</h3>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Comment form coming soon...</p>
          </div>
        </div>
      )}

      {post.is_locked && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">This post has been locked and no longer accepts new comments.</p>
        </div>
      )}
    </div>
  )
}