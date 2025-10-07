-- Populate comprehensive content from the consolidated knowledge base
-- Delete existing minimal content and add comprehensive articles

DELETE FROM content_articles WHERE id != 'e3ae6b04-aaf6-4250-8e5e-408187b83d93';

-- Insert comprehensive login and authentication articles
INSERT INTO content_articles (id, title, content, excerpt, category_id, author_id, content_type, status, difficulty_level, estimated_read_time, featured) VALUES
('login-001', 
'How to Login to Your Futuro AI Platform', 
'# How to Login to Your Futuro AI Platform

## Accessing Your Platform

### Login Process:
1. Navigate to your organization\'s Futuro AI URL (e.g., https://fu7uro.dev or your custom domain)
2. Enter your email address in the "Email Address" field
3. Enter your password in the "Password" field
4. Click the "Login" button

### Security Features:
- Secure HTTPS connections
- Session timeout after periods of inactivity
- Password recovery option ("Forgot Password?")
- Role-based access controls
- For administrative access, use the separate "Administrative Access" button

## Troubleshooting Login Issues

### Forgot Password
1. Click "Forgot Password?" on the login page
2. Enter your registered email address
3. Check your email for a password reset link
4. Follow the instructions to create a new password
5. Return to the login page with your new credentials

### Account Locked
After multiple failed login attempts, your account may be temporarily locked for security. Contact support at +1 727-617-4121 or support@futuro.ai for immediate assistance.

### Browser Compatibility
Futuro AI platform is optimized for:
- Chrome (recommended)
- Firefox
- Safari
- Microsoft Edge

Ensure JavaScript is enabled and cookies are allowed for optimal functionality.',
'Step-by-step guide to logging into your Futuro AI platform, including troubleshooting common login issues.',
'97a3b5b1-79c5-49ab-960e-f8db7e28820e',
'2fca41b7-c42c-42cf-af57-8aba84e97347',
'article',
'published',
'beginner',
5,
true),

('access-001',
'Platform Access and Authentication Guide',
'# Platform Access and Authentication Guide

## Getting Started with Platform Access

### First-Time Login
When you first access your Futuro AI platform:
1. You will receive login credentials via email
2. Navigate to your secure platform URL
3. Enter your temporary password
4. You will be prompted to change your password
5. Set up two-factor authentication if required

### Account Security
- Use strong, unique passwords
- Enable two-factor authentication when available
- Log out completely when using shared computers
- Report any suspicious account activity immediately
- Keep your contact information updated for security notifications

### Session Management
- Automatic logout after periods of inactivity
- All login attempts are monitored and logged
- Optional IP whitelisting for enhanced security
- Session data is encrypted and secure

## Mobile Access
The Futuro AI platform is fully responsive and accessible from mobile devices. Simply navigate to your platform URL using your mobile browser and log in with the same credentials.

## Support
If you continue to experience access issues:
- Live Chat: Available 24/7 through the platform
- Phone Support: +1 727-617-4121
- Email Support: support@futuro.ai
- Response Time: Typically within 2 hours during business hours',
'Comprehensive guide to platform access, authentication, and account security for Futuro AI users.',
'97a3b5b1-79c5-49ab-960e-f8db7e28820e',
'2fca41b7-c42c-42cf-af57-8aba84e97347',
'article',
'published',
'beginner',
7,
true),

('dashboard-001',
'Understanding Your Futuro AI Dashboard',
'# Understanding Your Futuro AI Dashboard

## Main Dashboard Interface

Upon successful login, you will be presented with the main dashboard interface, which serves as your central hub for interacting with the Futuro AI Platform.

### AI Orb - The Heart of Your Interface

The centerpiece of the dashboard is the **AI Orb**—a visually striking purple and pink animated sphere that represents your AI assistant. The orb provides real-time visual feedback during interactions:

**Orb States:**
- **Idle State**: Gentle pulsing with a soothing purple glow when waiting
- **Listening**: Expands with animated sound waves radiating outward when you speak
- **Thinking**: Particle effects swirl around the orb while processing requests
- **Speaking**: Flows with wave patterns during AI responses
- **Connection Status**: Color intensity changes reflect the AI\'s activity level

### Navigation Elements

**Header Section:**
- Connection status indicator (Connected/Disconnected)
- Agent ID display
- Logout button (top-right corner)

**Main Control Panel:**
- Start Call/End Call buttons for voice sessions
- Communication mode selectors (Voice, Text, Email, Advanced)
- Real-time status indicators

**Side Panels:**
- Activity Log with real-time updates
- Today\'s Stats with animated counters
- Recent Calls history
- Agent Memory Center access

## Communication Modes

### Voice Mode (Default)
- Purpose: Natural spoken conversations
- Visual: AI Orb with synchronized animations
- Best For: Multitasking, accessibility needs, natural interactions

### Text Mode
- Purpose: Written communication
- Visual: Text input interface replaces orb
- Best For: Quiet environments, complex queries, written records

### Email Mode
- Purpose: Email-related tasks and asynchronous communication
- Visual: Email composition interface
- Best For: Professional correspondence, complex projects, overnight processing

### Advanced Mode
- Purpose: Professional content generation
- Visual: Eight specialized content generation cards
- Best For: Content creation, marketing, business analysis',
'Complete guide to navigating and understanding your Futuro AI dashboard interface and features.',
'17cee242-11c5-4596-9eea-59da511d6344',
'2fca41b7-c42c-42cf-af57-8aba84e97347',
'article',
'published',
'beginner',
8,
true),

('voice-tech-001',
'Live Voice™ Technology Overview',
'# Live Voice™ Technology Overview

## Revolutionary Natural AI Conversation

Live Voice™ represents a breakthrough in conversational artificial intelligence, achieving an unprecedented **94% indistinguishability rate** in double-blind studies. This revolutionary technology creates AI agents that are virtually indistinguishable from human representatives.

## The Science Behind Human-Like AI

### Natural Conversation Elements

1. **Micro-pauses**: Natural hesitations while "thinking" or organizing thoughts
2. **Authentic Breathing**: Subtle breathing sounds and intonation variations that make conversations feel organic
3. **Controlled Disfluencies**: Occasional natural fillers like "um" or "uh" without affecting message clarity
4. **Adaptive Speech Speed**: Automatically adjusts pace based on topic complexity
5. **Contextual Awareness**: Understands and responds appropriately to conversation context

### Emotional Intelligence Capabilities

- **Empathy**: Responds with appropriate concern when customers express frustration
- **Professionalism**: Maintains composed, helpful tone during complex interactions
- **Enthusiasm**: Conveys genuine excitement when sharing positive information
- **Adaptability**: Seamlessly shifts emotional tone based on conversation context
- **De-escalation**: Never gets emotional or defensive, expertly handles frustrated users

## Voice Personality Options

### Professional Voice Selection (100+ Options)

1. **Rosa - The Warm Professional**
   - Mature female voice with serene, measured cadence
   - Perfect for medical practices, legal firms, financial services
   - Projects trustworthiness and professional competence

2. **Carlos - The Dynamic Consultant**
   - Male voice with moderate energy and clear articulation
   - Ideal for technical services, consultancies, B2B businesses
   - Projects efficiency, knowledge, and solution-oriented thinking

3. **Daniela - The Youthful Enthusiast**
   - Young, vibrant female voice with friendly tone
   - Excellent for retail, beauty salons, creative agencies
   - Creates immediate connection through warmth and enthusiasm

4. **Miguel - The Reliable Traditionalist**
   - Mature, measured male voice with formal yet welcoming tone
   - Perfect for luxury brands and high-end services
   - Conveys established expertise and reliability

## Advanced Features

### Real-Time Performance
- **Speech Recognition**: <150 milliseconds from end of speech
- **Processing Time**: <200 milliseconds for response generation
- **Voice Synthesis**: <100 milliseconds for audio generation
- **Total Response Time**: <450 milliseconds end-to-end

### Quality Metrics
- **Speech Recognition Accuracy**: 99.7% in ideal conditions
- **Response Relevance**: 98.5% of responses directly address customer queries
- **Conversation Coherence**: 97.8% conversation flow rated as natural
- **Customer Satisfaction**: 4.8/5.0 average rating for voice interactions',
'Comprehensive overview of Live Voice™ technology, the industry-leading conversational AI with 94% indistinguishability.',
'1a400cca-28da-426c-9c6e-19c88bedee48',
'2fca41b7-c42c-42cf-af57-8aba84e97347',
'article',
'published',
'advanced',
12,
true);

-- Add popular search terms to suggestions
INSERT INTO search_suggestions (suggestion, search_count, result_count, category) VALUES
('how to login', 50, 2, 'authentication'),
('login help', 45, 2, 'authentication'),
('platform access', 40, 3, 'authentication'),
('sign in', 35, 2, 'authentication'),
('dashboard guide', 30, 2, 'interface'),
('voice technology', 25, 1, 'technology'),
('AI orb', 20, 1, 'interface'),
('getting started', 60, 4, 'setup'),
('troubleshooting login', 15, 2, 'support'),
('forgot password', 25, 1, 'authentication')
ON CONFLICT (suggestion) DO UPDATE SET
    search_count = EXCLUDED.search_count,
    result_count = EXCLUDED.result_count;

-- Update search vector for new articles (this will be done automatically by triggers)
-- Just to be sure, we can manually refresh
UPDATE content_articles SET updated_at = CURRENT_TIMESTAMP WHERE id IN ('login-001', 'access-001', 'dashboard-001', 'voice-tech-001');