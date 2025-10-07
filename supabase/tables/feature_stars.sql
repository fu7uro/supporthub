CREATE TABLE feature_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_request_id UUID REFERENCES feature_requests(id) NOT NULL,
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_request_id,
    user_id)
);