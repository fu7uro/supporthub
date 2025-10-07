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
        const startTime = Date.now();
        const { 
            query, 
            contentTypes = ['articles'], 
            categoryId, 
            limit = 50, 
            offset = 0,
            includeRelated = true,
            includeSuggestions = true 
        } = await req.json();

        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user ID for analytics
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

        // Extract key terms from query for better matching
        const sanitizedQuery = query.trim().replace(/'/g, "''");
        
        // Extract key search terms from natural language queries
        const extractKeyTerms = (query) => {
            const lowercaseQuery = query.toLowerCase();
            const keyTerms = [];
            
            // Common question patterns
            const patterns = [
                { pattern: /how do i (\w+)/, extract: 1 },
                { pattern: /how to (\w+)/, extract: 1 },
                { pattern: /what is (\w+)/, extract: 1 },
                { pattern: /where is (\w+)/, extract: 1 },
                { pattern: /can i (\w+)/, extract: 1 }
            ];
            
            for (const p of patterns) {
                const match = lowercaseQuery.match(p.pattern);
                if (match && match[p.extract]) {
                    keyTerms.push(match[p.extract]);
                }
            }
            
            // Add important words (exclude common stop words)
            const stopWords = ['how', 'do', 'i', 'the', 'a', 'an', 'to', 'is', 'can', 'what', 'where', 'when', 'why'];
            const words = lowercaseQuery.split(' ').filter(word => 
                word.length > 2 && !stopWords.includes(word)
            );
            keyTerms.push(...words);
            
            return [...new Set(keyTerms)]; // Remove duplicates
        };
        
        const keyTerms = extractKeyTerms(query);
        console.log('Extracted key terms:', keyTerms);
        
        // Use direct SQL query approach for reliable results
        let searchResults = [];
        
        // Create a comprehensive search query that handles multiple scenarios
        const directQuery = `
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
                (
                    CASE 
                        WHEN title ILIKE '%${sanitizedQuery}%' THEN 100
                        WHEN excerpt ILIKE '%${sanitizedQuery}%' THEN 80
                        WHEN content ILIKE '%${sanitizedQuery}%' THEN 60
                        ${keyTerms.map((term, index) => {
                            const safeTerm = term.replace(/'/g, "''");
                            return `WHEN title ILIKE '%${safeTerm}%' THEN ${90 - index * 5}
                                    WHEN content ILIKE '%${safeTerm}%' THEN ${70 - index * 5}`;
                        }).join(' ')}
                        ELSE 10
                    END +
                    CASE WHEN featured THEN 20 ELSE 0 END
                ) as rank,
                CASE 
                    WHEN title ILIKE '%${sanitizedQuery}%' THEN 'exact_title'
                    WHEN excerpt ILIKE '%${sanitizedQuery}%' THEN 'excerpt_match'
                    WHEN content ILIKE '%${sanitizedQuery}%' THEN 'content_match'
                    ${keyTerms.map(term => {
                        const safeTerm = term.replace(/'/g, "''");
                        return `WHEN title ILIKE '%${safeTerm}%' THEN 'key_term_title'
                                WHEN content ILIKE '%${safeTerm}%' THEN 'key_term_content'`;
                    }).join(' ')}
                    ELSE 'general_match'
                END as match_type
            FROM content_articles 
            WHERE 
                status = 'published'
                AND (
                    title ILIKE '%${sanitizedQuery}%' 
                    OR excerpt ILIKE '%${sanitizedQuery}%' 
                    OR content ILIKE '%${sanitizedQuery}%'
                    ${keyTerms.map(term => {
                        const safeTerm = term.replace(/'/g, "''");
                        return `OR title ILIKE '%${safeTerm}%' OR content ILIKE '%${safeTerm}%'`;
                    }).join(' ')}
                )
            ORDER BY rank DESC, view_count DESC, created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        console.log('Executing search query for:', sanitizedQuery);
        console.log('Key terms extracted:', keyTerms);

        // Use direct REST API with enhanced search for key terms
        let searchUrl = `${supabaseUrl}/rest/v1/content_articles?select=*&status=eq.published`;
        
        // Build search conditions for both original query and key terms
        const searchConditions = [];
        searchConditions.push(`title.ilike.*${sanitizedQuery}*`);
        searchConditions.push(`content.ilike.*${sanitizedQuery}*`);
        searchConditions.push(`excerpt.ilike.*${sanitizedQuery}*`);
        
        // Add key term conditions
        keyTerms.forEach(term => {
            const safeTerm = term.replace(/[^a-zA-Z0-9 ]/g, '');
            if (safeTerm.length > 2) {
                searchConditions.push(`title.ilike.*${safeTerm}*`);
                searchConditions.push(`content.ilike.*${safeTerm}*`);
            }
        });
        
        searchUrl += `&or=(${searchConditions.join(',')})&order=view_count.desc,created_at.desc&limit=${limit}`;
        
        console.log('Search URL:', searchUrl);
        
        const directResponse = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (directResponse.ok) {
            const rawResults = await directResponse.json();
            console.log('Raw results found:', rawResults?.length || 0);
            
            // Transform results to match expected format
            searchResults = rawResults.map(article => ({
                content_type: 'article',
                id: article.id,
                title: article.title,
                description: article.excerpt || '',
                author_id: article.author_id,
                category_id: article.category_id,
                view_count: article.view_count,
                like_count: article.like_count,
                created_at: article.created_at,
                rank: (
                    (article.title && article.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 100 : 0) +
                    (article.excerpt && article.excerpt.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 80 : 0) +
                    (article.content && article.content.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 60 : 0) +
                    (article.featured ? 20 : 0) +
                    keyTerms.reduce((score, term, index) => {
                        const termLower = term.toLowerCase();
                        return score + (
                            (article.title && article.title.toLowerCase().includes(termLower) ? 90 - index * 5 : 0) +
                            (article.content && article.content.toLowerCase().includes(termLower) ? 70 - index * 5 : 0)
                        );
                    }, 0)
                ),
                match_type: (
                    article.title && article.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 'title_match' :
                    article.excerpt && article.excerpt.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 'excerpt_match' :
                    article.content && article.content.toLowerCase().includes(sanitizedQuery.toLowerCase()) ? 'content_match' :
                    'key_term_match'
                )
            }));
            
            // Sort by rank
            searchResults.sort((a, b) => b.rank - a.rank);
            
            console.log('Processed search results:', searchResults?.length || 0);
        } else {
            console.error('Direct query failed:', await directResponse.text());
        }

        // If no results, try fallback searches
        if (searchResults.length === 0) {
            console.log('No results from enhanced search, trying fallback methods...');
            
            // Fallback 1: Simple ILIKE search
            const fallbackQuery = `
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
                    1.0 as rank,
                    'fallback_ilike' as match_type
                FROM content_articles 
                WHERE 
                    status = 'published'
                    AND (
                        title ILIKE '%${sanitizedQuery}%' 
                        OR content ILIKE '%${sanitizedQuery}%'
                        OR excerpt ILIKE '%${sanitizedQuery}%'
                    )
                ORDER BY 
                    CASE WHEN title ILIKE '%${sanitizedQuery}%' THEN 1 ELSE 2 END,
                    view_count DESC
                LIMIT ${limit}
            `;

            const fallbackResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql: fallbackQuery })
            });

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData && Array.isArray(fallbackData)) {
                    searchResults = fallbackData;
                }
            }
        }

        // Get search suggestions if requested
        let suggestions = [];
        if (includeSuggestions && query.length > 2) {
            const suggestionsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_search_suggestions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    partial_query: sanitizedQuery,
                    suggestion_limit: 5
                })
            });

            if (suggestionsResponse.ok) {
                suggestions = await suggestionsResponse.json() || [];
            }
        }

        // Get related articles if requested and we have some results
        let relatedArticles = [];
        if (includeRelated && searchResults.length > 0) {
            const topResult = searchResults[0];
            if (topResult.category_id) {
                const relatedQuery = `
                    SELECT 
                        'article' as content_type,
                        id,
                        title,
                        excerpt as description,
                        category_id,
                        view_count,
                        created_at
                    FROM content_articles 
                    WHERE 
                        category_id = '${topResult.category_id}'
                        AND id != '${topResult.id}'
                        AND status = 'published'
                    ORDER BY view_count DESC, created_at DESC
                    LIMIT 3
                `;

                const relatedResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sql: relatedQuery })
                });

                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    if (relatedData && Array.isArray(relatedData)) {
                        relatedArticles = relatedData;
                    }
                }
            }
        }

        const responseTime = Date.now() - startTime;

        // Record search analytics
        if (userId) {
            try {
                await fetch(`${supabaseUrl}/rest/v1/rpc/record_search_analytics`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        original_query: query,
                        expanded_query: sanitizedQuery,
                        user_id: userId,
                        results_count: searchResults.length,
                        response_time_ms: responseTime
                    })
                });
            } catch (analyticsError) {
                console.log('Analytics recording failed:', analyticsError.message);
            }
        }

        // Add enhanced metadata to results
        const enhancedResults = searchResults.map(result => ({
            ...result,
            relevanceScore: result.rank || 1.0,
            snippet: result.description || '',
            category: result.category_id
        }));

        return new Response(JSON.stringify({
            data: {
                results: enhancedResults,
                total: enhancedResults.length,
                query: query,
                suggestions: suggestions,
                relatedArticles: relatedArticles,
                searchTime: responseTime,
                contentTypes: contentTypes,
                hasMore: enhancedResults.length === limit
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enhanced search error:', error);

        const errorResponse = {
            error: {
                code: 'ENHANCED_SEARCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});