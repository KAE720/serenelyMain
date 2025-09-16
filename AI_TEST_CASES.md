# AI Test Cases and Examples

## Test the AI Implementation

Run these test cases to validate the emotion analysis and explanation system:

### Test Case 1: Love and Affection
```javascript
await llmService.analyzeTone("I love you so much!");
// Expected: { color: 'green', confidence: >0.8 }
await llmService.getExplainer("I love you so much!");
// Expected: "The person is expressing romantic love and deep affection for you"
```

### Test Case 2: Work Stress
```javascript
await llmService.analyzeTone("I'm feeling really overwhelmed with work lately");
// Expected: { color: 'orange', confidence: >0.7 }
await llmService.getExplainer("I'm feeling really overwhelmed with work lately");
// Expected: "The person is telling you about challenges they're facing at work"
```

### Test Case 3: Anger and Disappointment
```javascript
await llmService.analyzeTone("I'm not happy with you right now");
// Expected: { color: 'red', confidence: >0.7 }
await llmService.getExplainer("I'm not happy with you right now");
// Expected: "The person is directly expressing displeasure with your actions or behavior"
```

### Test Case 4: Gratitude
```javascript
await llmService.analyzeTone("Thank you so much for helping me!");
// Expected: { color: 'green', confidence: >0.8 }
await llmService.getExplainer("Thank you so much for helping me!");
// Expected: "The person is expressing gratitude for something you did or said"
```

### Test Case 5: Questions (Neutral)
```javascript
await llmService.analyzeTone("What time is the meeting today?");
// Expected: { color: 'blue', confidence: >0.6 }
await llmService.getExplainer("What time is the meeting today?");
// Expected: "The person is asking a question and wants information or your opinion"
```

### Test Case 6: Complex Emotions
```javascript
await llmService.analyzeTone("I love that you're always so supportive when I'm stressed! 💕");
// Expected: { color: 'green', confidence: >0.8 }
await llmService.getExplainer("I love that you're always so supportive when I'm stressed! 💕");
// Expected: "The person is appreciating your consistent emotional support and care"
```

## Testing in the App

1. **Start the app**: `npx expo start`
2. **Open ChatScreen**: Navigate to any chat conversation
3. **Send messages**: Type the test messages above
4. **Observe results**: 
   - Message bubbles should be colored according to emotion
   - Tap the AI explainer button to see explanations
   - Check console logs for analysis details

## Console Testing

You can test the AI functions directly in the console:

```javascript
// In your app's debug console:
import llmService from './llmService';

// Initialize (if not already done)
await llmService.initialize();

// Test emotion analysis
const toneResult = await llmService.analyzeTone("I'm so angry right now!");
console.log('Tone:', toneResult);

// Test explanation
const explanation = await llmService.getExplainer("I'm so angry right now!");
console.log('Explanation:', explanation);

// Get detailed analysis
const detailed = await llmService.getDetailedAnalysis("I'm so angry right now!");
console.log('Detailed:', detailed);
```

## Expected Performance

- **Initialization**: ~1 second
- **Analysis per message**: <100ms
- **Accuracy**: >85% for clear emotional expressions
- **Memory usage**: <10MB
- **Network requirements**: None (fully offline)

## Validation Checklist

- [ ] Metro server starts without errors
- [ ] AI service initializes successfully
- [ ] Emotion colors match expectations
- [ ] Explanations are contextually appropriate
- [ ] Fallback system works when needed
- [ ] Performance is acceptable on device
- [ ] No memory leaks during extended use
