# Vercel Deployment Guide for FuturoClientHub

## Required Environment Variables

When deploying this project to Vercel, you'll need to add the following environment variables in your Vercel dashboard. Go to your project settings in Vercel and add these under "Environment Variables":

### Environment Variable Names and Values

Copy and paste each of these exactly as they appear:

#### Supabase Configuration
```
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Where to Get These Values

1. **VITE_SUPABASE_URL**: 
   - Go to your Supabase dashboard
   - Select your project
   - Go to Settings → API
   - Copy the "Project URL" value

2. **VITE_SUPABASE_ANON_KEY**:
   - In the same API settings page
   - Copy the "anon/public" key value

### Setting Up Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your FuturoClientHub project
3. Go to "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. For each variable:
   - Name: Enter the exact variable name (e.g., `VITE_SUPABASE_URL`)
   - Value: Enter your actual value (e.g., `https://yourproject.supabase.co`)
   - Environments: Select "Production", "Preview", and "Development"
   - Click "Save"

## Build Settings for Vercel

Vercel should automatically detect this as a Vite project, but if you need to configure manually:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (recommended)

## Additional Deployment Steps

### 1. Supabase Edge Functions Deployment

Your Supabase Edge Functions are already in the repository under `/supabase/functions/`. You'll need to deploy these to your Supabase project:

1. Install Supabase CLI: `npm install -g @supabase/cli`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your-project-id`
4. Deploy functions: `supabase functions deploy`

### 2. Database Setup

Your database schema and migrations are in the `/supabase/` directory:

1. Run the initial setup SQL from `/supabase/0000_elegant_init.sql`
2. Apply migrations from `/supabase/migrations/`
3. Run seed data from `/supabase/seed_final.sql`

### 3. Storage Buckets

The app uses Supabase storage for media files. Ensure you have a storage bucket named `community-media` with public access policies set up.

## Verification Steps

After deployment:

1. Check that your site loads at your Vercel URL
2. Test user authentication (sign up/sign in)
3. Verify that posts and comments can be created
4. Test the search functionality
5. Check that media uploads work correctly

## Common Issues and Solutions

### Build Errors
- Make sure all environment variables are set correctly
- Verify that your Supabase project is active and accessible
- Check that all dependencies are installed

### Runtime Errors
- Verify Supabase Edge Functions are deployed
- Check that database tables exist and have proper RLS policies
- Ensure storage buckets are created with correct permissions

## Support

If you encounter any issues during deployment:
1. Check the Vercel deployment logs
2. Verify your Supabase project configuration
3. Ensure all environment variables are correctly set
4. Check that your Supabase Edge Functions are deployed and accessible

## Quick Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables added to Vercel
- [ ] Database schema applied
- [ ] Edge Functions deployed
- [ ] Storage buckets created
- [ ] Project deployed to Vercel
- [ ] Basic functionality tested

## Notes

- This is a client-side React application that connects to Supabase for backend functionality
- All sensitive operations are handled through Supabase Edge Functions
- The app includes advanced features like semantic search and real-time updates
- Make sure your Supabase project has sufficient quotas for your expected usage

## Example Environment Variable Format

When adding to Vercel, your environment variables should look like this:

```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the example values with your actual Supabase project values.