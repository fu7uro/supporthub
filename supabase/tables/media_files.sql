CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_path TEXT NOT NULL,
    imagekit_url TEXT,
    thumbnail_url TEXT,
    content_type VARCHAR(20),
    content_id UUID,
    uploaded_by UUID REFERENCES user_profiles(id),
    processing_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);