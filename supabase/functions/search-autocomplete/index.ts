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
        const { query, limit = 10 } = await req.json();

        if (!query || query.trim().length < 2) {
            return new Response(JSON.stringify({ data: { suggestions: [] } }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const sanitizedQuery = query.trim().replace(/'/g, "''");
        
        // Get suggestions from multiple sources
        const suggestions = [];

        // 1. Popular search terms
        const popularResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_search_suggestions`, {
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

        if (popularResponse.ok) {
            const popularData = await popularResponse.json();
            if (popularData && Array.isArray(popularData)) {
                suggestions.push(...popularData.map(item => ({
                    text: item.suggestion,
                    type: 'popular',
                    count: item.search_count
                })));
            }
        }

        // 2. Article titles that match
        const titlesQuery = `
            SELECT DISTINCT title, view_count
            FROM content_articles 
            WHERE 
                status = 'published'
                AND title ILIKE '%${sanitizedQuery}%'
            ORDER BY view_count DESC
            LIMIT 5
        `;

        const titlesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql: titlesQuery })
        });

        if (titlesResponse.ok) {
            const titlesData = await titlesResponse.json();
            if (titlesData && Array.isArray(titlesData)) {
                suggestions.push(...titlesData.map(item => ({
                    text: item.title,
                    type: 'article_title',
                    count: item.view_count
                })));
            }
        }

        // 3. Synonym-based suggestions
        const synonymQuery = `
            SELECT DISTINCT term, synonyms, weight
            FROM search_synonyms 
            WHERE 
                term ILIKE '%${sanitizedQuery}%'
                OR '${sanitizedQuery}' = ANY(synonyms)
            ORDER BY weight DESC
            LIMIT 3
        `;

        const synonymResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql: synonymQuery })
        });

        if (synonymResponse.ok) {
            const synonymData = await synonymResponse.json();
            if (synonymData && Array.isArray(synonymData)) {
                synonymData.forEach(item => {
                    suggestions.push({
                        text: item.term,
                        type: 'synonym',
                        count: item.weight * 10
                    });
                    // Add synonyms
                    if (item.synonyms && Array.isArray(item.synonyms)) {
                        item.synonyms.forEach(synonym => {
                            if (synonym.toLowerCase().includes(sanitizedQuery.toLowerCase())) {
                                suggestions.push({
                                    text: synonym,
                                    type: 'synonym_match',
                                    count: item.weight * 5
                                });
                            }
                        });
                    }
                });
            }
        }

        // Remove duplicates and sort by relevance
        const uniqueSuggestions = [];
        const seen = new Set();
        
        suggestions.forEach(item => {
            const key = item.text.toLowerCase();
            if (!seen.has(key) && item.text.length > 0) {
                seen.add(key);
                uniqueSuggestions.push(item);
            }
        });

        // Sort by type priority and count
        const typePriority = {
            'popular': 4,
            'article_title': 3,
            'synonym': 2,
            'synonym_match': 1
        };

        uniqueSuggestions.sort((a, b) => {
            const priorityDiff = (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            return (b.count || 0) - (a.count || 0);
        });

        const finalSuggestions = uniqueSuggestions.slice(0, limit);

        return new Response(JSON.stringify({
            data: {
                suggestions: finalSuggestions,
                query: query,
                total: finalSuggestions.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Autocomplete error:', error);

        const errorResponse = {
            error: {
                code: 'AUTOCOMPLETE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});