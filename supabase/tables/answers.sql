CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    author_id UUID REFERENCES user_profiles(id) NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);