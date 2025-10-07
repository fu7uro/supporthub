-- Migration: add_search_indexes
-- Created at: 1759779272

-- Add full-text search columns and indexes
ALTER TABLE content_articles ADD COLUMN IF NOT EXISTS search_vector TSVECTOR 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(excerpt, '')), 'C')
    ) STORED;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS search_vector TSVECTOR 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(content, '')), 'B')
    ) STORED;

ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS search_vector TSVECTOR 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(content, '')), 'B')
    ) STORED;

ALTER TABLE feature_requests ADD COLUMN IF NOT EXISTS search_vector TSVECTOR 
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'B')
    ) STORED;

-- Create GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS content_articles_search_idx ON content_articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS questions_search_idx ON questions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS forum_posts_search_idx ON forum_posts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS feature_requests_search_idx ON feature_requests USING GIN(search_vector);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_content_articles_category ON content_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_content_articles_status ON content_articles(status);
CREATE INDEX IF NOT EXISTS idx_content_articles_created_at ON content_articles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_star_count ON feature_requests(star_count DESC);

CREATE INDEX IF NOT EXISTS idx_comments_content_type_id ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_content ON content_tags(content_type, content_id);;