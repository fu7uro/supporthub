-- Comprehensive Database Seeding Script
-- Populate content_articles table with Futuro AI Knowledge Base
-- Generated: 2025-10-07

-- Clear existing content
DELETE FROM content_articles;

-- Insert comprehensive knowledge base content

-- Platform Overview & Getting Started Articles
INSERT INTO content_articles (id, title, content, excerpt, category_id, content_type, status, featured, estimated_read_time, view_count, like_count, created_at, updated_at)
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
  'Complete guide to accessing and setting up your Futuro AI platform, including login process, security features, and quick start implementation.',
  '97a3b5b1-79c5-49ab-960e-f8db7e28820e', -- Getting Started
  'article',
  'published',
  true,
  8,
  0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  'What is Futuro AI Platform',
  'Futuro AI is the world''s most advanced conversational AI platform that creates AI agents truly indistinguishable from human representatives. After three years of intensive research and development, we''ve achieved an unprecedented 94% indistinguishability rate in double-blind studies, meaning 94 out of 100 callers believe they''re speaking with a real human.

## Key Value Propositions

- **24/7 Availability**: Never miss a call or opportunity, even outside business hours
- **Unlimited Scalability**: Handle one call or thousands simultaneously without busy signals
- **Cost Efficiency**: Save $3,000-$5,000/month per employee replaced
- **Consistent Quality**: Same high-quality service every time, regardless of volume or complexity
- **Rapid Deployment**: Get operational in as little as 24-48 hours

## Onboarding Process

### Phase 1: Initial Setup (Day 1)
- Account creation and login credentials setup
- Voice personality selection from 100+ options
- Basic configuration and company information input
- Phone system integration planning

### Phase 2: Knowledge Integration (Days 2-3)
- Business-specific training using website content
- Industry-specific customization
- Testing and refinement based on stakeholder feedback

### Phase 3: Go Live (Day 4-5)
- Full deployment with real-time monitoring
- Performance optimization and adjustments
- Staff training on system capabilities

What sets Futuro AI apart is our combination of Live Voice™ technology and MasterMind™ knowledge system, creating AI agents that truly understand your business and communicate naturally with customers.',
  'Learn about Futuro AI''s advanced conversational AI platform with 94% indistinguishability rate and comprehensive business automation capabilities.',
  '97a3b5b1-79c5-49ab-960e-f8db7e28820e', -- Getting Started
  'article',
  'published',
  true,
  6,
  0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);