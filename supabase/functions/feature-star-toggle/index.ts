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
        const { featureRequestId } = await req.json();

        if (!featureRequestId) {
            throw new Error('Feature request ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authentication required');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Check if user has already starred this feature request
        const existingStarResponse = await fetch(
            `${supabaseUrl}/rest/v1/feature_stars?feature_request_id=eq.${featureRequestId}&user_id=eq.${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!existingStarResponse.ok) {
            throw new Error('Failed to check existing star');
        }

        const existingStars = await existingStarResponse.json();
        const hasStarred = existingStars && existingStars.length > 0;

        let action = '';
        let newStarCount = 0;

        if (hasStarred) {
            // Remove star
            const deleteResponse = await fetch(
                `${supabaseUrl}/rest/v1/feature_stars?feature_request_id=eq.${featureRequestId}&user_id=eq.${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!deleteResponse.ok) {
                throw new Error('Failed to remove star');
            }

            // Decrement star count
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/feature_requests?id=eq.${featureRequestId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        star_count: `star_count - 1`,
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Failed to update star count');
            }

            const updatedFeature = await updateResponse.json();
            newStarCount = updatedFeature[0]?.star_count || 0;
            action = 'removed';
        } else {
            // Add star
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/feature_stars`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feature_request_id: featureRequestId,
                    user_id: userId,
                    created_at: new Date().toISOString()
                })
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to add star: ${errorText}`);
            }

            // Increment star count
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/feature_requests?id=eq.${featureRequestId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        star_count: `star_count + 1`,
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Failed to update star count');
            }

            const updatedFeature = await updateResponse.json();
            newStarCount = updatedFeature[0]?.star_count || 1;
            action = 'added';
        }

        return new Response(JSON.stringify({
            data: {
                action,
                starCount: newStarCount,
                hasStarred: !hasStarred,
                featureRequestId
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Feature star toggle error:', error);

        const errorResponse = {
            error: {
                code: 'STAR_TOGGLE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});