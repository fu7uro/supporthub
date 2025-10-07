-- Comprehensive Database Seeding Script
-- Populate content_articles table with Futuro AI Knowledge Base
-- Generated: 2025-10-07

-- Clear existing content
DELETE FROM content_articles;

-- Insert comprehensive knowledge base content

-- Platform Overview & Getting Started
INSERT INTO content_articles (id, title, content, category_id, author, status, featured, tags, meta_description, estimated_read_time, views, likes, published_at, created_at, updated_at)
VALUES 
(
  gen_random_uuid(),
  'Platform Setup and First Steps',
  'Futuro AI is the world''s most advanced conversational AI platform that creates AI agents truly indistinguishable from human representatives. After three years of intensive research and development, we''ve achieved an unprecedented 94% indistinguishability rate in double-blind studies.

## Getting Started: Login & Initial Setup

**Accessing Your Futuro AI Platform:**
1. Navigate to your organization''s Futuro AI URL (e.g., https://fu7uro.dev or your custom domain)
2. Enter your email address in the "Email Address" field
3. Enter your password in the "Password" field
4. Click the "Login" button

**Security Features:**
- Secure HTTPS connections
- Session timeout after periods of inactivity
- Password recovery option ("Forgot Password?")
- Role-based access controls
- For administrative access, use the separate "Administrative Access" button

## Quick Start Implementation (24-48 Hours)

The fastest way to get operational:

**What''s Included:**
- Simple phone forwarding to Futuro AI
- Website-based knowledge extraction using MasterMind™ technology
- Standard voice setup and personality selection
- Basic personalization (greeting adjustments and business information)
- Pre-configured industry agents ready for deployment
- Standard integration with existing phone systems
- Immediate operational capability

**Requirements:**
- Business phone number
- Company website (for knowledge extraction)
- Basic business information

## Authentication and Login Process

For first-time access, navigate to your provided URL, enter your email and password credentials provided during setup, and click "Login". If you encounter issues, use the "Forgot Password?" option or contact support.',
  '97a3b5b1-79c5-49ab-960e-f8db7e28820e', -- Getting Started
  'MiniMax Agent',
  'published',
  true,
  ARRAY['login', 'setup', 'getting started', 'authentication', 'quick start'],
  'Complete guide to accessing and setting up your Futuro AI platform, including login process, security features, and quick start implementation.',
  8,
  0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Add more sample content later if needed
-- This is a simplified version for the repository