# DIRECT COPILOT PROMPTS

## PROMPT 1: Install On-Device LLM
```
Install llama.rn for React Native on-device LLM inference. Add to package.json and handle iOS/Android setup for local model execution.
```

## PROMPT 2: Download TinyLlama Model  
```
Create script to download TinyLlama-1.1B-Chat model to assets/models/ directory. This is a small, Apache 2.0 licensed model perfect for mobile emotion classification.
```

## PROMPT 3: Replace Demo Mode with Real LLM
```
In llmService.js, replace the simulateEmotionAnalysis() demo function with real on-device LLM inference using llama.rn and TinyLlama model. 

Requirements:
- Load model from assets/models/tinyllama.bin
- For emotion classification: prompt "Classify emotion as angry|stressed|neutral|excited: [MESSAGE]"  
- For explanations: prompt "Explain what this message means in 1 sentence: [MESSAGE]"
- Keep same return format as demo mode
- Add fallback to demo if model fails

Focus on mobile performance with small context window and low temperature.
```

## PROMPT 4: Fix Message Explanations
```
The current getExplainer() function in llmService.js returns generic explanations like "The sender is giving you a brief response". 

Fix this to return specific explanations of what each message actually MEANS:
- "i love you" → "The person is expressing romantic love for you"
- "im stressed" → "The person is sharing that they feel overwhelmed"  
- "how are you" → "The person wants to know about your current wellbeing"
- "thank you" → "The person is showing gratitude for something you did"

Make explanations describe the MESSAGE CONTENT, not emotions or feelings.
```

## PROMPT 5: Optimize for Mobile
```
Optimize llmService.js LLM implementation for React Native mobile performance:
- Use minimal prompts (under 50 tokens)
- Set n_ctx=256, temperature=0.3, max_tokens=20
- Add memory management and cleanup
- Handle model loading asynchronously with progress indicators
- Implement graceful fallback if device has insufficient RAM
```

## PROMPT 6: Bundle Model with App
```
Update React Native build configuration to include the TinyLlama model file in the app bundle:
- Add to metro.config.js asset extensions
- Update iOS/Android build scripts to include model file
- Handle different file paths for iOS vs Android
- Add model integrity checking on app startup
```

## CURRENT CODE THAT NEEDS UPDATING:

The key files are:
- `/Users/kerem/SimpleGoogleAuthExpo/llmService.js` - Replace demo mode with real LLM
- `/Users/kerem/SimpleGoogleAuthExpo/ChatScreen.js` - Already calls the LLM functions correctly

## WHAT'S ALREADY WORKING:
✅ ChatScreen calls `llmService.analyzeTone(text)` and `llmService.getExplainer(text)`
✅ Message bubbles change color based on emotion  
✅ AI explanation popup shows when button tapped
✅ Demo mode provides fallback functionality

## WHAT NEEDS TO BE IMPLEMENTED:
❌ Real on-device LLM instead of demo mode
❌ Better message explanations (less generic)
❌ Model downloading and bundling
❌ Mobile optimization and memory management

## EXPECTED FINAL RESULT:
- Send "i love you" → Green bubble + "The person is expressing romantic love for you"
- Send "im angry" → Red bubble + "The person is expressing anger or frustration"  
- Send "how are you" → Blue bubble + "The person wants to know about your wellbeing"
- All running on-device with no internet required!
