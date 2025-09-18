# Phi-2 Local LLM Integration Guide

## Overview
Your React Native Expo app now includes a complete local LLM solution using Microsoft's Phi-2 model. This provides fully offline AI capabilities for:

- **Sentiment Analysis**: Automatic bubble coloring (red/negative, blue/neutral, green/positive)
- **Message Summaries**: AI-powered explanations of message meaning
- **CBT Therapist Mode**: Personal therapy assistant "Serine" with built-in CBT techniques

## Setup Instructions

### 1. Download Phi-2 Model
```bash
./setup-phi2.sh
```
This downloads the quantized Phi-2 model (~1.5GB) to `assets/models/`.

### 2. Install Dependencies
Already done, but for reference:
```bash
npm install llama.rn@0.6.15 @react-native-async-storage/async-storage
```

### 3. iOS Setup
```bash
cd ios && pod install
```

### 4. Run the App
```bash
expo start
```

## Features

### 1. Smart Bubble Coloring
- Messages automatically analyzed for sentiment
- Colors match your app theme:
  - Green (#2AB67B): Positive emotions
  - Red (#E63946): Negative emotions
  - Blue (#2D6CDF): Neutral emotions

### 2. AI Message Explanations
- Tap "AI" button on any message bubble
- Get contextual explanations of message meaning
- Powered by Phi-2 for nuanced understanding

### 3. CBT Therapist Mode
- Access via "💭 Talk to Serine" button in chat header
- Personal CBT assistant with therapeutic techniques
- Includes actionable CBT tips and reframing exercises
- All conversations private and local

## Technical Details

### Model Performance
- **Size**: ~1.5GB quantized (Q4_K_M)
- **Inference Time**: 2-5 seconds on iPhone 12+
- **Memory Usage**: ~500MB during inference
- **Battery Impact**: Moderate during active use

### Usage Limits
- **Free Tier**: 50 queries per day
- **Reset**: Daily at midnight
- **Tracking**: Stored locally in AsyncStorage

### Fallback System
1. **Primary**: Phi-2 local inference
2. **Secondary**: Your existing LLM service
3. **Tertiary**: Keyword-based analysis

## File Structure
```
/
├── localLLMService.js         # Core Phi-2 integration
├── enhancedLLMService.js      # Service wrapper for ChatScreen
├── CBTTherapistScreen.js      # Serine CBT assistant UI
├── ChatScreen.js              # Updated with Phi-2 integration
├── setup-phi2.sh             # Model download script
└── assets/models/
    └── phi-2.Q4_K_M.gguf     # Quantized Phi-2 model
```

## Usage Examples

### Sentiment Analysis
```javascript
import enhancedLLMService from './enhancedLLMService';

const result = await enhancedLLMService.analyzeTone("I love this!");
// Returns: { color: 'green', confidence: 0.89, isLLMEnhanced: true }
```

### Message Explanation
```javascript
const explanation = await enhancedLLMService.getExplainer(
  "Can't wait to see you tonight!",
  true // isCurrentUser
);
// Returns: "You expressed: Excitement about an upcoming meeting"
```

### CBT Session
```javascript
const cbtResponse = await enhancedLLMService.getCBTHelp(
  "I feel anxious about tomorrow's presentation"
);
// Returns: { response: "...", technique: "...", isEnhanced: true }
```

## Performance Optimization

### Best Practices
- Initialize LLM service on app start
- Use loading indicators for 2-5s inference times
- Monitor battery usage with extended AI sessions
- Consider caching frequent queries

### Memory Management
- Model automatically loads on first use
- Call `cleanup()` when app backgrounded
- Use `getStats()` to monitor performance

### Error Handling
- Graceful fallbacks to keyword analysis
- User-friendly error messages
- Automatic retry logic for failed inferences

## Privacy & Security
- **100% Local**: No data sent to external servers
- **Offline Capable**: Works without internet connection
- **User Control**: Clear usage tracking and limits
- **Data Retention**: Conversations stored locally only

## Troubleshooting

### Common Issues
1. **Model Not Loading**
   - Check file exists: `assets/models/phi-2.Q4_K_M.gguf`
   - Verify file size: ~1.5GB
   - Re-run setup script

2. **Slow Performance**
   - Test on iPhone 12+ or newer
   - Reduce `maxTokens` in service config
   - Check available device memory

3. **iOS Simulator Issues**
   - Simulator may be slower than device
   - Increase timeout values for testing
   - Use physical device for production testing

### Debug Commands
```javascript
// Check LLM status
const status = enhancedLLMService.getStatus();
console.log('LLM Status:', status);

// Get performance stats
const stats = await enhancedLLMService.getStats();
console.log('Performance:', stats);

// Reset usage limits (testing)
await localLLMService.resetUsage();
```

## Next Steps

### MVP Validation
1. Test with 5-10 users
2. Gather feedback on AI accuracy
3. Monitor performance metrics
4. Iterate on prompts and UX

### Future Enhancements
- Voice input for CBT sessions
- Mood tracking integration
- Personalized prompts
- Model fine-tuning
- Premium features gating

## Support
- Model issues: Check Hugging Face community
- Integration help: Review service logs
- Performance: Monitor device capabilities
- UI/UX: Test on target devices

---

**Built with**: Phi-2 (Microsoft), llama.rn, React Native, Expo
**Model Source**: https://huggingface.co/microsoft/phi-2-gguf
**Version**: 1.0.0
