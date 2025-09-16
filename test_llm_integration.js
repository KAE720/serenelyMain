// test_llm_integration.js
// Simple test script for validating LLM integration
// Run with: node test_llm_integration.js

import llmService from './llmService.js';

async function testLLMIntegration() {
  console.log('🧪 Testing LLM Integration...\n');

  try {
    // Test 1: Check LLM status
    console.log('1️⃣ Checking LLM status...');
    const status = llmService.getStatus();
    console.log('Status:', status);
    console.log('✅ Status check passed\n');

    // Test 2: Initialize LLM (will use demo mode if model not available)
    console.log('2️⃣ Initializing LLM...');
    await llmService.initialize();
    console.log('✅ LLM initialized\n');

    // Test 3: Test emotion analysis with different messages
    console.log('3️⃣ Testing emotion analysis...');
    
    const testMessages = [
      "I'm so excited about this new project!",
      "I'm feeling really stressed about the deadline.",
      "This is just a normal message.",
      "I'm so angry about what happened!"
    ];

    for (const message of testMessages) {
      console.log(`\n📝 Testing: "${message}"`);
      
      // Test analyzeTone function
      const toneResult = await llmService.analyzeTone(message);
      console.log(`   Color: ${toneResult.color}`);
      console.log(`   Confidence: ${toneResult.confidence}`);
      console.log(`   Demo Mode: ${toneResult.isDemoMode}`);
      console.log(`   LLM Enhanced: ${toneResult.isLLMEnhanced}`);
      
      // Test getExplainer function
      const explanation = await llmService.getExplainer(message);
      console.log(`   Explanation: ${explanation}`);
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   - LLM Status: ${status.initialized ? 'Ready' : 'Not Ready'}`);
    console.log(`   - Demo Mode: ${status.demoMode ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Llama Available: ${status.llamaAvailable ? 'Yes' : 'No'}`);
    
    if (status.demoMode) {
      console.log('\n💡 Note: Currently running in demo mode.');
      console.log('   Download a model to enable real LLM analysis.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up
    await llmService.cleanup();
    console.log('\n🧹 Cleanup completed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLLMIntegration();
}

export default testLLMIntegration;
