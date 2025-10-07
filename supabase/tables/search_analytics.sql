CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(500) NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    results_count INTEGER,
    clicked_result_id UUID,
    clicked_result_type VARCHAR(20),
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);