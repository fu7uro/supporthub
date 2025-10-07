-- Migration: create_search_enhancements
-- Created at: 1759781525

-- Enhanced Search Functionality Migration
-- This migration adds comprehensive search enhancements including synonym mapping and improved indexing

-- Create search synonyms table for semantic matching
CREATE TABLE IF NOT EXISTS search_synonyms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    synonyms TEXT[] NOT NULL,
    category VARCHAR(100),
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast synonym lookups
CREATE INDEX IF NOT EXISTS idx_search_synonyms_term ON search_synonyms USING GIN (to_tsvector('english', term));
CREATE INDEX IF NOT EXISTS idx_search_synonyms_synonyms ON search_synonyms USING GIN (synonyms);

-- Create search suggestions table for autocomplete
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    suggestion VARCHAR(255) NOT NULL UNIQUE,
    search_count INTEGER DEFAULT 0,
    result_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    last_searched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast suggestion lookups
CREATE INDEX IF NOT EXISTS idx_search_suggestions_suggestion ON search_suggestions USING GIN (to_tsvector('english', suggestion));
CREATE INDEX IF NOT EXISTS idx_search_suggestions_count ON search_suggestions (search_count DESC);

-- Create enhanced search analytics
CREATE TABLE IF NOT EXISTS enhanced_search_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_query TEXT NOT NULL,
    expanded_query TEXT,
    user_id UUID,
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID,
    clicked_result_type VARCHAR(50),
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_enhanced_search_analytics_query ON enhanced_search_analytics USING GIN (to_tsvector('english', original_query));
CREATE INDEX IF NOT EXISTS idx_enhanced_search_analytics_user ON enhanced_search_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_search_analytics_timestamp ON enhanced_search_analytics (search_timestamp);

-- Populate synonym mappings for common search terms
INSERT INTO search_synonyms (term, synonyms, category, weight) VALUES
-- Authentication and Access
('login', ARRAY['sign in', 'log in', 'access', 'authentication', 'sign on', 'connect', 'enter'], 'authentication', 10),
('password', ARRAY['credentials', 'passcode', 'authentication', 'security'], 'authentication', 8),
('account', ARRAY['profile', 'user', 'member', 'registration'], 'authentication', 7),

-- Platform and Interface
('dashboard', ARRAY['interface', 'main screen', 'home', 'control panel', 'overview'], 'interface', 9),
('platform', ARRAY['system', 'application', 'software', 'service'], 'platform', 8),
('AI orb', ARRAY['AI agent', 'virtual assistant', 'bot', 'AI interface', 'agent'], 'interface', 9),

-- Communication and Features
('voice', ARRAY['audio', 'speech', 'talking', 'speaking', 'vocal'], 'communication', 8),
('chat', ARRAY['text', 'messaging', 'conversation', 'talk'], 'communication', 7),
('email', ARRAY['mail', 'message', 'correspondence'], 'communication', 7),

-- Technical and Setup
('setup', ARRAY['configuration', 'install', 'initialization', 'configure', 'getting started'], 'setup', 9),
('integration', ARRAY['connection', 'linking', 'sync', 'connect'], 'technical', 8),
('API', ARRAY['interface', 'connection', 'integration', 'service'], 'technical', 7),

-- Support and Help
('help', ARRAY['support', 'assistance', 'guide', 'tutorial', 'how to'], 'support', 9),
('troubleshooting', ARRAY['problems', 'issues', 'errors', 'debugging', 'fixing'], 'support', 8),
('guide', ARRAY['tutorial', 'instructions', 'manual', 'documentation'], 'support', 7),

-- Business and Analytics
('analytics', ARRAY['metrics', 'statistics', 'data', 'reporting', 'performance'], 'analytics', 8),
('ROI', ARRAY['return on investment', 'value', 'benefits', 'cost savings'], 'business', 7),
('reporting', ARRAY['reports', 'analytics', 'metrics', 'data'], 'analytics', 7)
ON CONFLICT DO NOTHING;

-- Function to expand search query with synonyms
CREATE OR REPLACE FUNCTION expand_search_query(query_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    expanded_query TEXT := query_text;
    synonym_record RECORD;
    query_words TEXT[];
    word TEXT;
BEGIN
    -- Split query into words
    query_words := string_to_array(lower(trim(query_text)), ' ');
    
    -- For each word, find synonyms
    FOREACH word IN ARRAY query_words
    LOOP
        -- Find synonyms for this word
        FOR synonym_record IN 
            SELECT unnest(synonyms) as synonym 
            FROM search_synonyms 
            WHERE lower(term) = word OR word = ANY(synonyms)
        LOOP
            -- Add synonyms to expanded query if not already present
            IF position(synonym_record.synonym in expanded_query) = 0 THEN
                expanded_query := expanded_query || ' ' || synonym_record.synonym;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN expanded_query;
END;
$$;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(partial_query TEXT, suggestion_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    suggestion TEXT,
    search_count INTEGER,
    category TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.suggestion,
        s.search_count,
        s.category
    FROM search_suggestions s
    WHERE s.suggestion ILIKE '%' || partial_query || '%'
       OR to_tsvector('english', s.suggestion) @@ plainto_tsquery('english', partial_query)
    ORDER BY s.search_count DESC, s.suggestion
    LIMIT suggestion_limit;
END;
$$;

-- Function to record search analytics
CREATE OR REPLACE FUNCTION record_search_analytics(
    original_query TEXT,
    expanded_query TEXT,
    user_id UUID DEFAULT NULL,
    results_count INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    analytics_id UUID;
BEGIN
    INSERT INTO enhanced_search_analytics (
        original_query,
        expanded_query,
        user_id,
        results_count,
        response_time_ms
    ) VALUES (
        original_query,
        expanded_query,
        user_id,
        results_count,
        response_time_ms
    ) RETURNING id INTO analytics_id;
    
    -- Update or insert search suggestion
    INSERT INTO search_suggestions (suggestion, search_count, result_count)
    VALUES (original_query, 1, results_count)
    ON CONFLICT (suggestion) DO UPDATE SET
        search_count = search_suggestions.search_count + 1,
        result_count = EXCLUDED.result_count,
        last_searched = CURRENT_TIMESTAMP;
    
    RETURN analytics_id;
END;
$$;

-- Improve existing search vectors with better weighting
UPDATE content_articles SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'C')
WHERE search_vector IS NULL OR search_vector = '';

-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_articles_search_enhanced 
ON content_articles USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_content_articles_title_trgm 
ON content_articles USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_content_articles_content_trgm 
ON content_articles USING GIN (content gin_trgm_ops);

-- Create composite search function for better results
CREATE OR REPLACE FUNCTION enhanced_content_search(
    search_query TEXT,
    content_types TEXT[] DEFAULT ARRAY['articles'],
    category_filter UUID DEFAULT NULL,
    result_limit INTEGER DEFAULT 50,
    result_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    content_type TEXT,
    id UUID,
    title TEXT,
    description TEXT,
    author_id UUID,
    category_id UUID,
    view_count INTEGER,
    like_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL,
    match_type TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    expanded_query TEXT;
    ts_query tsquery;
BEGIN
    -- Expand query with synonyms
    expanded_query := expand_search_query(search_query);
    ts_query := plainto_tsquery('english', expanded_query);
    
    -- Search content_articles with multiple matching strategies
    IF 'articles' = ANY(content_types) THEN
        RETURN QUERY
        SELECT 
            'article'::TEXT as content_type,
            ca.id,
            ca.title,
            ca.excerpt as description,
            ca.author_id,
            ca.category_id,
            ca.view_count,
            ca.like_count,
            ca.created_at,
            (
                -- Full-text search rank
                ts_rank(ca.search_vector, ts_query) * 10 +
                -- Title exact match bonus
                CASE WHEN ca.title ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
                -- Title similarity bonus
                similarity(ca.title, search_query) * 3 +
                -- Content similarity bonus
                similarity(ca.content, search_query) * 1 +
                -- Featured article bonus
                CASE WHEN ca.featured THEN 2 ELSE 0 END
            )::REAL as rank,
            CASE 
                WHEN ca.title ILIKE '%' || search_query || '%' THEN 'exact_title'
                WHEN ca.search_vector @@ ts_query THEN 'full_text'
                WHEN similarity(ca.title, search_query) > 0.3 THEN 'fuzzy_title'
                ELSE 'fuzzy_content'
            END as match_type
        FROM content_articles ca
        WHERE 
            ca.status = 'published'
            AND (
                ca.search_vector @@ ts_query
                OR ca.title ILIKE '%' || search_query || '%'
                OR ca.content ILIKE '%' || search_query || '%'
                OR similarity(ca.title, search_query) > 0.2
                OR similarity(ca.content, search_query) > 0.1
            )
            AND (category_filter IS NULL OR ca.category_id = category_filter)
        ORDER BY rank DESC
        LIMIT result_limit OFFSET result_offset;
    END IF;
    
    -- Add other content types as needed...
    
END;
$$;;