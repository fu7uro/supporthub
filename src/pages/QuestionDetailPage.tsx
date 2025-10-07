import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle, User, Calendar, Eye, CheckCircle, Award } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabase'

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()

  // Fetch question with answers
  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      if (!id) throw new Error('Question ID is required')
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories(name, color),
          user_profiles!questions_author_id_fkey(full_name, company_name, role),
          answers(
            *,
            user_profiles!answers_author_id_fkey(full_name, company_name, role)
          )
        `)
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      if (!data) throw new Error('Question not found')
      return data
    },
    enabled: !!id
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

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question Not Found</h1>
          <p className="text-gray-600 mb-4">
            The question you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/questions"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/questions"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Questions
      </Link>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Question Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status, question.has_accepted_answer)}`}>
              {question.has_accepted_answer && (
                <CheckCircle className="h-4 w-4 inline mr-1" />
              )}
              {getStatusText(question.status, question.has_accepted_answer)}
            </span>
            
            {question.categories && (
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: question.categories.color + '20',
                  color: question.categories.color 
                }}
              >
                {question.categories.name}
              </span>
            )}
            
            {question.bounty_points > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Award className="h-3 w-3 mr-1" />
                {question.bounty_points} pts bounty
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>

          {/* Author and Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                {question.user_profiles?.full_name || 'Anonymous'}
                {question.user_profiles?.company_name && (
                  <span className="ml-1">from {question.user_profiles.company_name}</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(question.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{question.view_count} views</span>
            </div>
            
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>{question.answer_count} answers</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>
              {question.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {question.answers && question.answers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {question.answers
              .sort((a, b) => {
                // Sort accepted answer first, then by vote score
                if (a.is_accepted && !b.is_accepted) return -1
                if (!a.is_accepted && b.is_accepted) return 1
                return b.vote_score - a.vote_score
              })
              .map((answer) => (
                <div key={answer.id} className="p-6">
                  <div className="space-y-4">
                    {/* Answer Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {answer.user_profiles?.full_name || 'Anonymous'}
                            {answer.user_profiles?.company_name && (
                              <span className="ml-1">from {answer.user_profiles.company_name}</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {new Date(answer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {answer.is_accepted && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepted Answer
                        </span>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="prose max-w-none">
                      <ReactMarkdown>
                        {answer.content}
                      </ReactMarkdown>
                    </div>

                    {/* Answer Actions */}
                    <div className="flex items-center space-x-4 pt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Score: {answer.vote_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
            <p className="text-gray-500 mb-4">Be the first to help by answering this question.</p>
          </div>
        )}
      </div>

      {/* Answer Form Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Answer form coming soon...</p>
        </div>
      </div>
    </div>
  )
}