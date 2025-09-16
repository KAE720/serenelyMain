# COPILOT INSTRUCTIONS FOR LLM EMOTION CHAT APP

## Overview
This React Native app uses an on-device LLM (llama.rn) to analyze message emotions in real-time. Each message is classified by color (red, orange, blue, green) and can show AI explanations when tapped.

## Quick Start for Copilot

### 1. Core LLM Functions (llmService.js)
The LLM service provides two simple functions:

```javascript
// FUNCTION 1: Analyze message tone - returns color
const toneResult = await llmService.analyzeTone("Your message text");
console.log(toneResult.color); // 'red', 'orange', 'blue', or 'green'

// FUNCTION 2: Get explanation - returns one sentence
const explanation = await llmService.getExplainer("Your message text");
console.log(explanation); // "This message shows excitement and positive energy."
```

### 2. Color Mapping (colorHelper.js)
Use these helper functions for consistent UI colors:

```javascript
import { getMessageBubbleColor, getMessageBorderColor, getMessageTextColor } from './colorHelper';

const backgroundColor = getMessageBubbleColor(emotionColor, isCurrentUser);
const borderColor = getMessageBorderColor(emotionColor);
const textColor = getMessageTextColor(emotionColor, isCurrentUser);
```

**Color Scheme:**
- 🔴 `red` = Angry emotions (#FF6B6B)
- 🟠 `orange` = Stressed emotions (#FFA726)
- 🔵 `blue` = Neutral emotions (#42A5F5)
- 🟢 `green` = Excited/positive emotions (#66BB6A)

### 3. Message Structure
Each message should have this structure:

```javascript
const message = {
    id: "unique_id",
    text: "Message content",
    sender: "user_id",
    timestamp: "ISO_string",
    emotionColor: "red", // or orange, blue, green
    isAnalyzed: true
};
```

## File Breakdown

### Main Chat Logic (ChatScreen.js)

**Key Functions:**
- `analyzeMessageTone(messageText)` - Get emotion color for message
- `getMessageExplanation(messageText)` - Get AI explanation
- `handleMessageTap(message)` - Show/hide explanation popup
- `sendMessage()` - Send new message with emotion analysis
- `renderMessage(item)` - Render message bubble with tap functionality

**Message Flow:**
1. User types message → `sendMessage()` called
2. Message analyzed → `analyzeMessageTone()` returns color
3. Message added to state with emotion color
4. User taps message → `handleMessageTap()` shows explanation
5. Explanation fetched → `getMessageExplanation()` returns text

### LLM Service (llmService.js)

**Initialization:**
- Auto-initializes on first use
- Falls back to demo mode if model unavailable
- Handles conditional imports for native modules

**Core Analysis:**
- `analyzeTone()` - Returns color + confidence + metadata
- `getExplainer()` - Returns clean one-sentence explanation
- Demo mode provides realistic mock analysis

### Color Helpers (colorHelper.js)

**UI Functions:**
- `getMessageBubbleColor()` - Background color for bubbles
- `getMessageBorderColor()` - Border color for messages
- `getMessageTextColor()` - Text color for readability
- `getEmotionLabel()` - Human-readable emotion names

## Development Tips

### Testing LLM Integration
1. **Demo Mode**: LLM service automatically uses demo mode if model unavailable
2. **Live Testing**: Use TestLLMScreen.js to test analysis functions
3. **Model Management**: Use ModelManagementScreen.js to download/manage models

### Adding New Features
1. **New Emotion**: Add to colorHelper.js mappings
2. **UI Changes**: Focus on ChatScreen.js renderMessage function
3. **Analysis Logic**: Extend llmService.js analyze functions

### Error Handling
- LLM service gracefully handles missing models
- Falls back to demo mode automatically
- All functions return safe defaults on error

## Common Copilot Tasks

### Change Emotion Colors
Edit `EMOTION_COLORS` in colorHelper.js:
```javascript
export const EMOTION_COLORS = {
    'red': '#YOUR_RED_COLOR',
    'orange': '#YOUR_ORANGE_COLOR',
    'blue': '#YOUR_BLUE_COLOR',
    'green': '#YOUR_GREEN_COLOR'
};
```

### Modify Analysis Logic
Edit simulation in llmService.js `simulateEmotionAnalysis()`:
```javascript
if (lowerText.includes('your_keyword')) {
    emotion = 'your_emotion';
    explanation = 'Your explanation';
}
```

### Update Message UI
Edit `renderMessage()` in ChatScreen.js:
```javascript
<TouchableOpacity
    style={[styles.messageBubble, { backgroundColor: color }]}
    onPress={() => handleMessageTap(item)}
>
    {/* Your message content */}
</TouchableOpacity>
```

### Add New Screens
1. Create screen component
2. Add to navigation in App.js
3. Update ProfileScreen.js for navigation buttons

## Architecture Notes

### LLM Integration
- Uses llama.rn for on-device inference
- Models downloaded at runtime via modelManager.js
- Graceful fallback to keyword analysis if LLM unavailable

### State Management
- Simple React state (no Redux needed)
- Messages stored in component state
- LLM service is singleton for efficiency

### Performance
- LLM initialization cached
- Demo mode for development without model download
- Efficient message rendering with FlatList

## File Dependencies

```
App.js → ChatScreen.js → llmService.js → modelManager.js
            ↓              ↓
      colorHelper.js  enhancedToneAnalysisService.js
```

**Keep Working:**
- Google Auth (firebase.js) - unchanged
- Navigation logic (HomeScreen.js, ProfileScreen.js)
- Model management (ModelManagementScreen.js)
- Testing tools (TestLLMScreen.js)

This architecture is designed to be modular and easy for Copilot to understand and extend!
