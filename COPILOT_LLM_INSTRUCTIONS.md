# GitHub Copilot Instructions: On-Device LLM Implementation

## Overview
This document provides step-by-step instructions for implementing a **free, open-source, commercializable on-device LLM** for emotion analysis in the React Native chat app. The implementation uses **llama.rn** with a **Phi-3 Mini model** for real-time emotion classification and message explanation.

## 🎯 Goals
- ✅ Classify message emotions into 4 colors: red (angry), orange (stressed), blue (neutral), green (excited)
- ✅ Provide AI explanations for messages via popup
- ✅ Maintain existing UI/UX completely unchanged
- ✅ Use only free, open-source, commercializable components
- ✅ Run entirely on-device (no cloud APIs)

## 📋 Prerequisites
The project structure is already set up with:
- `llmService.js` - Main LLM service with Copilot integration functions
- `ChatScreen.js` - Chat UI with emotion analysis integration
- `modelManager.js` - Model download and management
- All UI components and styling preserved

## 🔧 Implementation Steps

### Step 1: Install Required Dependencies

```bash
# Install the main LLM library
npm install llama.rn

# Install file system utilities for model management
npm install react-native-fs

# Install progress tracking for downloads
npm install react-native-progress

# For iOS, run pod install
cd ios && pod install && cd ..
```

### Step 2: Configure Native Modules

#### For Android (android/app/build.gradle):
```gradle
android {
    // ... existing config

    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
    }

    // Ensure proper NDK configuration
    ndkVersion "23.1.7779620"
}
```

#### For iOS (ios/Podfile):
```ruby
# Add after platform declaration
pod 'llama.rn', :path => '../node_modules/llama.rn'

# Update deployment target if needed
platform :ios, '12.0'
```

### Step 3: Implement Model Download System

The `modelManager.js` is already configured. You need to:

1. **Choose a Model**: Use Microsoft's Phi-3 Mini (3.8B parameters, ~2.3GB)
   - Model URL: `https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf`
   - License: MIT (fully commercializable)
   - Size: ~2.3GB (efficient for mobile)

2. **Update Model Configuration** in `modelManager.js`:
```javascript
const MODEL_CONFIG = {
  name: 'Phi-3-Mini-4K-Instruct',
  url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
  filename: 'phi3-mini-4k-instruct-q4.gguf',
  size: 2400000000, // ~2.4GB
  checksum: '', // Add MD5/SHA256 if available
  version: '1.0.0'
};
```

### Step 4: Configure LLM Context Parameters

In `llmService.js`, the LLM is configured with optimal mobile parameters:

```javascript
// Optimized for mobile performance
this.context = await LlamaContext.initFromFile(modelInfo.path, {
  n_ctx: 512,        // Context window (smaller for mobile)
  n_threads: 2,      // CPU threads (adjust based on device)
  use_mlock: false,  // Disable memory locking on mobile
  use_mmap: true,    // Enable memory mapping for efficiency
});
```

### Step 5: Implement Emotion Analysis Prompt

The service uses a structured prompt for consistent results:

```javascript
// Emotion analysis prompt in llmService.js
createEmotionPrompt(text) {
  return `Analyze the emotional tone of this message and respond with ONLY the following format:

EMOTION: [angry/stressed/neutral/excited]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [brief explanation]

Message to analyze: "${text}"

Response:`;
}
```

### Step 6: Test the Implementation

#### Test Demo Mode (No Model Required):
```javascript
// In your test file or console
import llmService from './llmService';

// Enable demo mode for testing
llmService.enableDemoMode();

// Test emotion analysis
const result = await llmService.analyzeTone("I'm so excited about this!");
console.log(result); // Should return { color: 'green', confidence: 0.85, ... }

// Test explanation
const explanation = await llmService.getExplainer("I'm feeling stressed about work");
console.log(explanation); // Should return a one-sentence explanation
```

#### Test Real LLM (After Model Download):
```javascript
// After downloading the model
await llmService.initialize();
const status = llmService.getStatus();
console.log('LLM Status:', status);

// Test with real LLM
const analysis = await llmService.analyzeTone("This is amazing!");
console.log('Real LLM Analysis:', analysis);
```

### Step 7: Integrate with UI

The ChatScreen.js is already integrated. The key integration points are:

#### Color Mapping Helper:
```javascript
// Helper function for Copilot clarity
const colorToEmotionMap = {
  'red': 'angry',      // High energy negative
  'orange': 'stressed', // Low energy negative
  'blue': 'neutral',   // Balanced/calm
  'green': 'excited'   // High energy positive
};
```

#### Message Analysis:
```javascript
const analyzeToneForMessage = async (text) => {
  const copilotAnalysis = await llmService.analyzeTone(text);
  const mappedTone = colorToEmotionMap[copilotAnalysis.color] || 'neutral';

  return {
    tone: mappedTone,
    confidence: copilotAnalysis.confidence,
    explanation: await llmService.getExplainer(text),
    isEnhanced: copilotAnalysis.isLLMEnhanced
  };
};
```

### Step 8: Performance Optimization

#### Memory Management:
```javascript
// Clean up LLM context when app goes to background
useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      llmService.cleanup();
    } else if (nextAppState === 'active') {
      llmService.initialize();
    }
  };

  AppState.addEventListener('change', handleAppStateChange);
  return () => AppState.removeEventListener('change', handleAppStateChange);
}, []);
```

#### Progressive Loading:
```javascript
// Show loading states for model download
const [modelStatus, setModelStatus] = useState('checking');

useEffect(() => {
  const checkModel = async () => {
    setModelStatus('checking');
    const isDownloaded = await modelManager.isModelDownloaded();
    setModelStatus(isDownloaded ? 'ready' : 'needs_download');
  };
  checkModel();
}, []);
```

### Step 9: Error Handling and Fallbacks

The implementation includes multiple fallback layers:

1. **Demo Mode**: Simulates LLM analysis using keyword matching
2. **Enhanced Analysis**: Falls back to rule-based analysis
3. **Basic Analysis**: Simple keyword detection

```javascript
// Automatic fallback chain
try {
  // Try LLM analysis
  const result = await llmService.analyzeTone(text);
} catch (error) {
  // Fall back to enhanced analysis
  const result = await enhancedToneAnalysisService.analyzeTone(text);
} catch (error) {
  // Fall back to basic keyword analysis
  const result = basicToneAnalysis(text);
}
```

### Step 10: Production Deployment

#### Build Configuration:
```javascript
// metro.config.js - ensure GGUF files are included
module.exports = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'gguf', 'ggml'],
  },
};
```

#### App Store Compliance:
- ✅ Uses only open-source libraries
- ✅ No cloud dependencies
- ✅ Fully runs on-device
- ✅ MIT licensed model (Phi-3)
- ✅ No user data collection

## 🧪 Testing Checklist

- [ ] Demo mode works without model
- [ ] Model downloads successfully
- [ ] LLM initializes correctly
- [ ] Emotion classification returns correct colors
- [ ] AI explanations are generated
- [ ] UI remains unchanged
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable
- [ ] App works offline
- [ ] Fallbacks function properly

## 🎨 UI Integration Points

The AI features integrate seamlessly with existing UI:

1. **Message Bubbles**: Color changes based on LLM analysis
2. **AI Button**: Shows explanation popup when tapped
3. **Status Indicators**: Shows when LLM vs demo mode is active
4. **Loading States**: Progressive enhancement as model loads

## 🔒 Privacy & Licensing

- **Model**: Microsoft Phi-3 Mini (MIT License)
- **Library**: llama.rn (MIT License)
- **Data**: 100% on-device processing
- **Commercial Use**: Fully permitted
- **Distribution**: No restrictions

## 📱 Device Requirements

- **iOS**: 12.0+ with 4GB+ RAM
- **Android**: API 21+ with 4GB+ RAM
- **Storage**: 3GB free space for model
- **CPU**: ARM64 recommended

## 🛠️ Troubleshooting

### Common Issues:

1. **Metro bundler fails**: Add GGUF extension to metro.config.js
2. **iOS build fails**: Run `pod install` after npm install
3. **Android build fails**: Check NDK version and packaging options
4. **Model won't load**: Verify file permissions and storage space
5. **Performance issues**: Reduce n_ctx or n_threads parameters

### Debug Commands:
```javascript
// Check LLM status
console.log(llmService.getStatus());

// Check model info
console.log(await modelManager.getModelInfo());

// Test model validation
console.log(await modelManager.validateModel());
```

## 🚀 Next Steps

After implementation:
1. Test on various devices for performance
2. Fine-tune LLM parameters for your use case
3. Consider model quantization for smaller size
4. Add A/B testing between LLM and rule-based analysis
5. Monitor battery usage and optimize accordingly

---

**Note**: This implementation is designed to be completely free, open-source, and commercializable. All components use permissive licenses suitable for commercial distribution.
