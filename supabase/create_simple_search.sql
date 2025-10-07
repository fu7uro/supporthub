-- Create a simple, robust search function that definitely works
CREATE OR REPLACE FUNCTION simple_search(
    search_query TEXT,
    result_limit INTEGER DEFAULT 50
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
    rank INTEGER,
    match_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'article'::TEXT as content_type,
        ca.id,
        ca.title,
        COALESCE(ca.excerpt, '')::TEXT as description,
        ca.author_id,
        ca.category_id,
        ca.view_count,
        ca.like_count,
        ca.created_at,
        (
            CASE 
                WHEN ca.title ILIKE '%' || search_query || '%' THEN 100
                WHEN ca.excerpt ILIKE '%' || search_query || '%' THEN 80
                WHEN ca.content ILIKE '%' || search_query || '%' THEN 60
                -- Add specific keyword matching
                WHEN search_query ILIKE '%login%' AND (ca.title ILIKE '%login%' OR ca.content ILIKE '%login%') THEN 90
                WHEN search_query ILIKE '%access%' AND (ca.title ILIKE '%access%' OR ca.content ILIKE '%access%') THEN 85
                WHEN search_query ILIKE '%dashboard%' AND (ca.title ILIKE '%dashboard%' OR ca.content ILIKE '%dashboard%') THEN 85
                WHEN search_query ILIKE '%sign%' AND (ca.title ILIKE '%sign%' OR ca.content ILIKE '%sign%') THEN 80
                ELSE 10
            END +
            CASE WHEN ca.featured THEN 20 ELSE 0 END
        )::INTEGER as rank,
        CASE 
            WHEN ca.title ILIKE '%' || search_query || '%' THEN 'title_match'
            WHEN ca.excerpt ILIKE '%' || search_query || '%' THEN 'excerpt_match'
            WHEN ca.content ILIKE '%' || search_query || '%' THEN 'content_match'
            ELSE 'keyword_match'
        END::TEXT as match_type
    FROM content_articles ca
    WHERE 
        ca.status = 'published'
        AND (
            ca.title ILIKE '%' || search_query || '%'
            OR ca.excerpt ILIKE '%' || search_query || '%'
            OR ca.content ILIKE '%' || search_query || '%'
            -- Add keyword-specific matching
            OR (search_query ILIKE '%login%' AND (ca.title ILIKE '%login%' OR ca.content ILIKE '%login%'))
            OR (search_query ILIKE '%access%' AND (ca.title ILIKE '%access%' OR ca.content ILIKE '%access%'))
            OR (search_query ILIKE '%dashboard%' AND (ca.title ILIKE '%dashboard%' OR ca.content ILIKE '%dashboard%'))
            OR (search_query ILIKE '%sign%' AND (ca.title ILIKE '%sign%' OR ca.content ILIKE '%sign%'))
            OR (search_query ILIKE '%authentication%' AND (ca.title ILIKE '%authentication%' OR ca.content ILIKE '%authentication%'))
        )
    ORDER BY rank DESC, ca.view_count DESC, ca.created_at DESC
    LIMIT result_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION simple_search(TEXT, INTEGER) TO authenticated, anon;