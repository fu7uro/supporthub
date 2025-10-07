CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES user_profiles(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    status VARCHAR(20) DEFAULT 'open',
    has_accepted_answer BOOLEAN DEFAULT false,
    bounty_points INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);