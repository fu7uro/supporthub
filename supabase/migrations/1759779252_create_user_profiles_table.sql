-- Migration: create_user_profiles_table
-- Created at: 1759779252

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    industry VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT false,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);;