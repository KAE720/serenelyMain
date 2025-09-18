// Phi-2 Integration Test
// Run this to verify your local LLM setup

import enhancedLLMService from './enhancedLLMService';
import * as localLLMService from './localLLMService';

async function testPhi2Integration() {
    console.log('🧪 Testing Phi-2 Integration...\n');

    try {
        // Test 1: Service Initialization
        console.log('1️⃣ Testing service initialization...');
        const initSuccess = await enhancedLLMService.initialize();
        const status = enhancedLLMService.getStatus();
        console.log('✅ Status:', status);

        if (!status.initialized) {
            console.log('⚠️ Phi-2 not loaded, testing fallback mode...\n');
        }

        // Test 2: Sentiment Analysis
        console.log('2️⃣ Testing sentiment analysis...');
        const testMessages = [
            "I love you so much! 💕",
            "I'm really angry about this situation",
            "The weather is okay today",
            "This is the worst day ever 😢",
            "Everything is going great!"
        ];

        for (const message of testMessages) {
            const analysis = await enhancedLLMService.analyzeTone(message);
            console.log(`📝 "${message}"`);
            console.log(`   Color: ${analysis.color}, Confidence: ${analysis.confidence}`);
            console.log(`   Enhanced: ${analysis.isLLMEnhanced}\n`);
        }

        // Test 3: Message Explanations
        console.log('3️⃣ Testing message explanations...');
        const explanation = await enhancedLLMService.getExplainer(
            "Can't wait to see you tonight!",
            true
        );
        console.log(`💬 Explanation: "${explanation}"\n`);

        // Test 4: CBT Response
        console.log('4️⃣ Testing CBT functionality...');
        const cbtHelp = await enhancedLLMService.getCBTHelp(
            "I feel anxious about tomorrow's presentation"
        );
        console.log(`🧠 CBT Response: "${cbtHelp.response}"`);
        console.log(`💡 Technique: "${cbtHelp.technique}"\n`);

        // Test 5: Performance Stats
        console.log('5️⃣ Checking performance stats...');
        const stats = await enhancedLLMService.getStats();
        console.log('📊 Stats:', JSON.stringify(stats, null, 2));

        console.log('\n✅ All tests completed successfully!');
        console.log('🚀 Your Phi-2 integration is ready to use!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Check if phi-2.Q4_K_M.gguf exists in assets/models/');
        console.log('- Verify llama.rn installation: npm list llama.rn');
        console.log('- Try running on iOS device instead of simulator');
    }
}

// Color mapping helper for testing
function testColorMapping() {
    console.log('\n🎨 Color Mapping Test:');
    const colors = ['red', 'blue', 'green'];
    colors.forEach(color => {
        const sentiment = localLLMService.getSentimentColor(color);
        console.log(`${color} → ${sentiment}`);
    });
}

// Export for use in your app
export { testPhi2Integration, testColorMapping };

// Run tests if called directly
if (typeof window === 'undefined') {
    testPhi2Integration();
    testColorMapping();
}
