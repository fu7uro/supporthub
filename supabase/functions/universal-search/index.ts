Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { query, contentTypes, categoryId, limit = 50, offset = 0 } = await req.json();

        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Log search analytics
        const authHeader = req.headers.get('authorization');
        let userId = null;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (error) {
                console.log('Could not get user from token:', error.message);
            }
        }

        const searchResults = [];
        const searchTerm = query.trim().replace(/'/g, "''"); // Escape single quotes
        
        // Determine which content types to search
        const typesToSearch = contentTypes && contentTypes.length > 0 
            ? contentTypes 
            : ['articles', 'questions', 'forum_posts', 'feature_requests'];

        // Search content_articles
        if (typesToSearch.includes('articles')) {
            let articlesQuery = `
                SELECT 
                    'article' as content_type,
                    id,
                    title,
                    excerpt as description,
                    author_id,
                    category_id,
                    view_count,
                    like_count,
                    created_at,
                    ts_rank(search_vector, plainto_tsquery('english', '${searchTerm}')) as rank
                FROM content_articles 
                WHERE search_vector @@ plainto_tsquery('english', '${searchTerm}')
                AND status = 'published'
            `;
            
            if (categoryId) {
                articlesQuery += ` AND category_id = '${categoryId}'`;
            }
            
            articlesQuery += ` ORDER BY rank DESC LIMIT ${limit} OFFSET ${offset}`;

            const articlesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: articlesQuery })
            });

            if (articlesResponse.ok) {
                const articlesData = await articlesResponse.json();
                if (articlesData && Array.isArray(articlesData)) {
                    searchResults.push(...articlesData);
                }
            }
        }

        // Search questions
        if (typesToSearch.includes('questions')) {
            let questionsQuery = `
                SELECT 
                    'question' as content_type,
                    id,
                    title,
                    content as description,
                    author_id,
                    category_id,
                    view_count,
                    answer_count as like_count,
                    created_at,
                    ts_rank(search_vector, plainto_tsquery('english', '${searchTerm}')) as rank
                FROM questions 
                WHERE search_vector @@ plainto_tsquery('english', '${searchTerm}')
                AND status != 'deleted'
            `;
            
            if (categoryId) {
                questionsQuery += ` AND category_id = '${categoryId}'`;
            }
            
            questionsQuery += ` ORDER BY rank DESC LIMIT ${limit} OFFSET ${offset}`;

            const questionsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: questionsQuery })
            });

            if (questionsResponse.ok) {
                const questionsData = await questionsResponse.json();
                if (questionsData && Array.isArray(questionsData)) {
                    searchResults.push(...questionsData);
                }
            }
        }

        // Search forum_posts
        if (typesToSearch.includes('forum_posts')) {
            let forumQuery = `
                SELECT 
                    'forum_post' as content_type,
                    id,
                    title,
                    content as description,
                    author_id,
                    category_id,
                    view_count,
                    reply_count as like_count,
                    created_at,
                    ts_rank(search_vector, plainto_tsquery('english', '${searchTerm}')) as rank
                FROM forum_posts 
                WHERE search_vector @@ plainto_tsquery('english', '${searchTerm}')
                AND status = 'active'
            `;
            
            if (categoryId) {
                forumQuery += ` AND category_id = '${categoryId}'`;
            }
            
            forumQuery += ` ORDER BY rank DESC LIMIT ${limit} OFFSET ${offset}`;

            const forumResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: forumQuery })
            });

            if (forumResponse.ok) {
                const forumData = await forumResponse.json();
                if (forumData && Array.isArray(forumData)) {
                    searchResults.push(...forumData);
                }
            }
        }

        // Search feature_requests
        if (typesToSearch.includes('feature_requests')) {
            let featureQuery = `
                SELECT 
                    'feature_request' as content_type,
                    id,
                    title,
                    description,
                    author_id,
                    category_id,
                    0 as view_count,
                    star_count as like_count,
                    created_at,
                    ts_rank(search_vector, plainto_tsquery('english', '${searchTerm}')) as rank
                FROM feature_requests 
                WHERE search_vector @@ plainto_tsquery('english', '${searchTerm}')
                AND status != 'rejected'
            `;
            
            if (categoryId) {
                featureQuery += ` AND category_id = '${categoryId}'`;
            }
            
            featureQuery += ` ORDER BY rank DESC LIMIT ${limit} OFFSET ${offset}`;

            const featureResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: featureQuery })
            });

            if (featureResponse.ok) {
                const featureData = await featureResponse.json();
                if (featureData && Array.isArray(featureData)) {
                    searchResults.push(...featureData);
                }
            }
        }

        // Sort all results by rank and limit
        searchResults.sort((a, b) => (b.rank || 0) - (a.rank || 0));
        const limitedResults = searchResults.slice(0, limit);

        // Log search analytics
        if (userId) {
            await fetch(`${supabaseUrl}/rest/v1/search_analytics`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search_query: query,
                    user_id: userId,
                    results_count: limitedResults.length,
                    search_timestamp: new Date().toISOString()
                })
            });
        }

        return new Response(JSON.stringify({
            data: {
                results: limitedResults,
                total: limitedResults.length,
                query: query,
                contentTypes: typesToSearch
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Search error:', error);

        const errorResponse = {
            error: {
                code: 'SEARCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});