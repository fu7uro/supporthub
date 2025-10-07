CREATE TABLE content_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id UUID REFERENCES categories(id),
    author_id UUID REFERENCES user_profiles(id),
    content_type VARCHAR(50) DEFAULT 'article',
    status VARCHAR(20) DEFAULT 'published',
    difficulty_level VARCHAR(20),
    estimated_read_time INTEGER,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);