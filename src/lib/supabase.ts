import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types
export interface ContentArticle {
  id: number
  title: string
  content: string
  summary?: string
  category?: string
  tags?: string[]
  created_at: string
  updated_at: string
  author_id?: string
  is_published: boolean
  view_count: number
  search_vector?: string
}

export interface ForumPost {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  category_id?: number
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  last_reply_at?: string
}

export interface Comment {
  id: number
  content: string
  author_id: string
  post_id?: number
  article_id?: number
  question_id?: number
  feature_request_id?: number
  parent_id?: number
  created_at: string
  updated_at: string
  is_edited: boolean
}

export interface Question {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  category_id?: number
  is_answered: boolean
  view_count: number
  answer_count: number
  tags?: string[]
}

export interface Answer {
  id: number
  content: string
  question_id: number
  author_id: string
  created_at: string
  updated_at: string
  is_accepted: boolean
  vote_score: number
}

export interface FeatureRequest {
  id: number
  title: string
  description: string
  author_id: string
  created_at: string
  updated_at: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  star_count: number
  comment_count: number
  category_id?: number
  tags?: string[]
}

export interface FeatureStar {
  id: number
  feature_request_id: number
  user_id: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  bio?: string
  role: 'user' | 'admin' | 'moderator'
  created_at: string
  updated_at: string
  last_login?: string
  preferences?: any
}

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  color?: string
  created_at: string
  post_count: number
  question_count: number
}

export interface Tag {
  id: number
  name: string
  description?: string
  color?: string
  usage_count: number
  created_at: string
}

export interface SearchAnalytics {
  id: number
  query: string
  user_id?: string
  results_count: number
  clicked_result_id?: number
  search_type: 'full_text' | 'semantic' | 'hybrid'
  created_at: string
  response_time_ms: number
}

export interface MediaFile {
  id: number
  filename: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  is_public: boolean
  alt_text?: string
  description?: string
}

// Enhanced search function
export const enhancedSearch = async (query: string, filters?: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('enhanced-search', {
      body: {
        query,
        filters,
      },
    })

    if (error) {
      console.error('Enhanced search error:', error)
      return { data: null, error }
    }

    return { data: data?.data || [], error: null }
  } catch (err) {
    console.error('Enhanced search exception:', err)
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown search error')
    }
  }
}

// Feature star toggle function
export const toggleFeatureStar = async (featureRequestId: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('feature-star-toggle', {
      body: {
        feature_request_id: featureRequestId,
      },
    })

    if (error) {
      console.error('Feature star toggle error:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Feature star toggle exception:', err)
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown toggle error')
    }
  }
}

// Search autocomplete function
export const searchAutocomplete = async (query: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('search-autocomplete', {
      body: {
        query,
      },
    })

    if (error) {
      console.error('Search autocomplete error:', error)
      return { data: [], error }
    }

    return { data: data?.suggestions || [], error: null }
  } catch (err) {
    console.error('Search autocomplete exception:', err)
    return { 
      data: [], 
      error: err instanceof Error ? err : new Error('Unknown autocomplete error')
    }
  }
}
