# On-Device LLM Emotion Analysis

This React Native chat app now includes **on-device Large Language Model (LLM)** capabilities for real-time emotion analysis and message explanation.

## 🎯 Features

- **4-Color Emotion Classification**: Messages are automatically classified into colors:
  - 🔴 **Red**: Angry/Frustrated emotions
  - 🟠 **Orange**: Stressed/Worried emotions  
  - 🔵 **Blue**: Neutral/Calm emotions
  - 🟢 **Green**: Excited/Happy emotions

- **AI Explainer**: Tap the AI button on any message to get a one-sentence explanation of what the message means emotionally

- **100% On-Device**: All AI processing happens locally - no cloud APIs, no data sharing

- **Free & Open Source**: Uses only open-source, commercializable components

## 🔧 Technical Implementation

### Core Components

1. **`llmService.js`** - Main LLM service with two key functions:
   - `analyzeTone(text)` → Returns emotion color (red/orange/blue/green)
   - `getExplainer(text)` → Returns one-sentence explanation

2. **`ChatScreen.js`** - Chat UI with integrated emotion analysis
   - Automatically analyzes new messages
   - Shows colored message bubbles
   - Displays AI explanations on tap

3. **`modelManager.js`** - Handles model download and storage
   - Downloads Microsoft Phi-3 Mini model (~2.3GB)
   - Validates model integrity
   - Manages local storage

### LLM Stack

- **Model**: Microsoft Phi-3 Mini 4K Instruct (MIT License)
- **Size**: ~2.3GB (quantized for mobile efficiency)
- **Library**: llama.rn (React Native LLAMA implementation)
- **Context**: 512 tokens (optimized for mobile performance)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
./setup_llm.sh
```

### 2. Test Demo Mode (No Model Required)
```bash
npm start
```
The app will run in demo mode using intelligent keyword analysis.

### 3. Download Real LLM Model
- Open the app
- Go to Model Management screen
- Tap "Download Model" 
- Wait for Phi-3 Mini to download (~2.3GB)

### 4. Enjoy Real AI Analysis
Once the model downloads, the app automatically switches to real LLM analysis.

## 📱 Usage

### Emotion Classification
Messages are automatically analyzed and colored:
```javascript
// Example usage in code
const result = await llmService.analyzeTone("I'm so excited!");
// Returns: { color: 'green', confidence: 0.89, isDemoMode: false }
```

### AI Explanations
Get explanations for any message:
```javascript
const explanation = await llmService.getExplainer("I'm feeling stressed");
// Returns: "This message expresses anxiety and concern about current circumstances."
```

## 🔄 Fallback System

The app includes a robust fallback system:

1. **Real LLM**: When model is available and loaded
2. **Demo Mode**: Intelligent keyword-based analysis
3. **Basic Analysis**: Simple pattern matching
4. **Safe Fallback**: Always returns neutral if all else fails

## 🎨 UI Integration

The AI features integrate seamlessly without changing the existing UI:

- **Message Bubbles**: Automatically colored based on emotion
- **AI Button**: Appears on messages for explanations
- **Status Indicators**: Shows LLM vs demo mode status
- **Loading States**: Progressive enhancement as model loads

## 📊 Performance

### Device Requirements
- **RAM**: 4GB+ recommended
- **Storage**: 3GB free space for model
- **OS**: iOS 12+ / Android API 21+
- **CPU**: ARM64 recommended

### Optimizations
- Context window limited to 512 tokens
- 2 CPU threads for processing
- Memory mapping for efficiency
- Automatic cleanup on background

## 🔒 Privacy & Licensing

### Privacy
- ✅ 100% on-device processing
- ✅ No data sent to servers
- ✅ No user data collection
- ✅ Works completely offline

### Licensing
- **Model**: MIT License (Microsoft Phi-3)
- **Library**: MIT License (llama.rn)
- **Commercial Use**: ✅ Fully permitted
- **Redistribution**: ✅ No restrictions

## 🧪 Testing

### Manual Testing
1. Send different types of messages
2. Check color classification accuracy
3. Tap AI buttons for explanations
4. Verify demo mode works without model

### Automated Testing
```bash
node test_llm_integration.js
```

### Debug Commands
```javascript
// Check LLM status
console.log(llmService.getStatus());

// Force demo mode
llmService.enableDemoMode();

// Check model info
console.log(await modelManager.getModelInfo());
```

## 🛠️ Troubleshooting

### Common Issues

**Model won't download**
- Check internet connection
- Verify 3GB+ free storage
- Try restarting the app

**App crashes on startup**
- Reduce context window size in llmService.js
- Check device RAM availability
- Clear app cache

**Poor emotion accuracy**
- Model may still be loading
- Check if demo mode is active
- Verify model downloaded completely

**Build failures**
- Run `pod install` on iOS
- Check metro.config.js includes GGUF files
- Verify NDK version on Android

### Debug Tools
```javascript
// Enable detailed logging
llmService.enableDebugMode();

// Check memory usage
console.log(await modelManager.getMemoryUsage());

// Validate model
console.log(await modelManager.validateModel());
```

## 🔄 Updates & Maintenance

### Model Updates
- New models can be added to modelManager.js
- App supports multiple model configurations
- Automatic fallback to previous model if new one fails

### Performance Tuning
- Adjust context window size for speed/accuracy tradeoff
- Modify thread count based on device capabilities
- Enable/disable memory mapping for memory-constrained devices

## 📈 Future Enhancements

Potential improvements:
- Multiple model support (different sizes)
- Custom emotion categories
- Conversation-level sentiment tracking
- Batch processing for better efficiency
- Model fine-tuning capabilities

## 🤝 Contributing

To add new features:
1. Extend `llmService.js` with new analysis functions
2. Update prompts for different analysis types
3. Add new UI components in `ChatScreen.js`
4. Update tests in `test_llm_integration.js`

## 📚 Documentation

- **Full Instructions**: `COPILOT_LLM_INSTRUCTIONS.md`
- **API Reference**: See function comments in `llmService.js`
- **Model Documentation**: Check Microsoft Phi-3 documentation
- **llama.rn Docs**: Visit the llama.rn GitHub repository

---

**Note**: This implementation prioritizes user privacy, performance, and commercial viability while providing sophisticated AI-powered emotion analysis capabilities.
