// testLLMArchitecture.js
// Test script to validate LLM architecture without downloading the full model

import modelManager from './modelManager';
import llmService from './llmService';
import enhancedToneAnalysisService from './services/enhancedToneAnalysisService';

// Test function to validate architecture
async function testLLMArchitecture() {
  console.log('🧪 Testing LLM Architecture...\n');

  try {
    // Test 1: Model Manager
    console.log('📁 Testing Model Manager...');
    const storageInfo = await modelManager.checkStorageSpace();
    console.log(`Storage available: ${Math.round(storageInfo.availableMB)}MB`);
    console.log(`Storage required: ${storageInfo.requiredMB}MB`);
    console.log(`Storage sufficient: ${storageInfo.sufficient ? '✅' : '❌'}\n`);

    // Test 2: Enhanced Tone Analysis Service
    console.log('🎭 Testing Enhanced Tone Analysis Service...');
    const testMessages = [
      "I'm so excited about this project!",
      "I'm feeling really stressed about work.",
      "That makes me angry.",
      "I'm having a good day today.",
      "This is just a normal message."
    ];

    for (const message of testMessages) {
      console.log(`\nAnalyzing: "${message}"`);
      const analysis = await enhancedToneAnalysisService.analyzeTone(message);
      console.log(`Emotion: ${analysis.tone}`);
      console.log(`Confidence: ${Math.round(analysis.confidence * 100)}%`);
      console.log(`Method: ${analysis.method || 'unknown'}`);
      console.log(`Enhanced: ${analysis.enhanced ? '✅' : '❌'}`);
    }

    // Test 3: Service Status
    console.log('\n📊 Service Status:');
    const modelStatus = await enhancedToneAnalysisService.getModelStatus();
    console.log(`Model downloaded: ${modelStatus.downloaded ? '✅' : '❌'}`);
    console.log(`LLM ready: ${modelStatus.llmReady ? '✅' : '❌'}`);
    console.log(`Download progress: ${modelStatus.downloadProgress}%`);

    console.log('\n✅ Architecture test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Architecture test failed:', error);
    return false;
  }
}

// Export test function
export { testLLMArchitecture };
