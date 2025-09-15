# Serene - Communication & Emotional Intelligence App

A React Native app that helps couples, friends, and people with special needs improve communication through AI-powered tone analysis and emotional intelligence features.

## 🎯 MVP Features (Current)

✅ **Authentication**: Email/Password + Google OAuth
✅ **One-on-One Chat**: Real-time messaging with conversation history
✅ **Tone Analysis**: AI-powered tone detection with colored message bubbles
✅ **Explainer**: Tap any message to understand its emotional tone
✅ **Smart Suggestions**: AI-recommended responses based on incoming message tone

## 🚀 Quick Start

### Frontend (React Native/Expo)

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Backend (Node.js/Express + PostgreSQL)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up PostgreSQL database
createdb serene_app
psql serene_app < ../database/schema.sql

# Start the backend server
npm run dev
```

## 📱 App Structure

```
├── App.js                    # Main app entry point with auth routing
├── AuthScreen.js             # Email/password + Google login
├── HomeScreen.js             # Main navigation container
├── MessagesScreen.js         # Conversation list
├── ChatScreen.js             # Individual chat with tone analysis
├── ContactsScreen.js         # Add friends by SerenID
├── AIShrinkScreen.js         # AI emotional support (Serene)
├── ProfileScreen.js          # User profile & logout
├── services/
│   └── toneAnalysisService.js # AI tone analysis (mock)
└── backend/
    ├── server.js             # Express API server
    └── package.json          # Backend dependencies
```

## 🎨 Key Features Explained

### 1. **Tone-Colored Message Bubbles**
- Each message gets analyzed for emotional tone
- Color-coded border indicates: positive (green), stressed (orange), supportive (light green), etc.
- Confidence percentage shows AI accuracy

### 2. **Message Explainer**
- Tap the "?" button on any message
- Get detailed explanation of the emotional tone
- Helps users understand how their messages come across

### 3. **Smart Response Suggestions**
- After sending a message, AI suggests appropriate responses
- Helps users communicate more effectively
- Reduces misunderstandings and conflicts

### 4. **SerenID System**
- Unique public IDs (like "SRN12ABC34") for privacy
- Add friends without sharing phone numbers
- Email remains private

## 🔧 Environment Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Expo CLI
- iOS Simulator or Android Emulator

### Firebase Setup (for Google Auth)
1. Create a Firebase project
2. Add your iOS and Android apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Update `firebase.js` with your config

### Database Setup
```sql
-- Create database
createdb serene_app

-- Run migrations
psql serene_app < database/schema.sql

-- Verify tables
psql serene_app -c "\\dt"
```

## 🧠 AI/ML Integration

### Current (MVP)
- **Mock tone analysis** with keyword detection
- Basic response suggestions
- Simple explanation generation

### Future (Post-MVP)
- **OpenAI/Claude API** for real tone analysis
- **Local LLM** for privacy and offline support
- Advanced pattern recognition
- Conversation insights and summaries

## 📊 Database Schema

```sql
users (
  id, email, password_hash, full_name, seren_id,
  google_id, apple_id, profile_picture_url, created_at
)

conversations (
  id, user1_id, user2_id, created_at, updated_at
)

messages (
  id, conversation_id, sender_id, content,
  tone, tone_confidence, tone_explanation, created_at
)
```

## 🗺️ Roadmap

### Stage 2: Enhanced Features
- [ ] Real-time messaging (WebSockets)
- [ ] Push notifications
- [ ] End-to-end encryption
- [ ] Voice messages with emotion detection
- [ ] Conversation mood tracking

### Stage 3: AI Features
- [ ] AI Shrink (Serene) with conversation context
- [ ] Pattern recognition & alerts
- [ ] "What I Meant To Say" rephrasing
- [ ] Custom tone training
- [ ] Conversation summaries

### Stage 4: Premium Features
- [ ] Advanced analytics dashboard
- [ ] Relationship insights
- [ ] AI mediator for conflicts
- [ ] Multiple conversation participants
- [ ] Wellness content & tips

## 🎯 Monetization

### Free Tier
- Basic tone detection (10 messages/day)
- Limited AI explanations
- Standard UI theme

### Premium ($4.99/month)
- Unlimited tone analysis
- Advanced AI insights
- Custom response suggestions
- Conversation summaries
- Priority AI Shrink access
- Premium UI themes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/serene/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/serene/discussions)
- **Email**: support@serene-app.com

---

**Built with ❤️ for better human communication**
