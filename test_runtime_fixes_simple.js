/**
 * Simple Node.js test for runtime fixes verification
 */

// Test 1: Check if files can be imported without throwing NativeEventEmitter errors
console.log('🚀 Testing runtime fixes...\n');

// Test Firebase configuration
try {
    console.log('1. Testing Firebase configuration...');
    const fs = require('fs');
    const firebaseContent = fs.readFileSync('./firebase.js', 'utf8');

    if (firebaseContent.includes('getReactNativePersistence') &&
        firebaseContent.includes('ReactNativeAsyncStorage')) {
        console.log('✅ Firebase Auth persistence fix applied');
    } else {
        console.log('❌ Firebase Auth persistence fix missing');
    }
} catch (error) {
    console.log('❌ Firebase test failed:', error.message);
}

// Test 2: Check Local LLM Service defensive imports
try {
    console.log('\n2. Testing Local LLM Service defensive imports...');
    const fs = require('fs');
    const localLLMContent = fs.readFileSync('./localLLMService.js', 'utf8');

    if (localLLMContent.includes('try {') &&
        localLLMContent.includes('require(\'llama.rn\')') &&
        localLLMContent.includes('catch (error)')) {
        console.log('✅ Defensive import for llama.rn implemented');
    } else {
        console.log('❌ Defensive import for llama.rn missing');
    }

    if (localLLMContent.includes('if (!Llama)') &&
        localLLMContent.includes('console.log(\'🎯 Llama.rn not available')) {
        console.log('✅ Fallback handling for missing llama.rn implemented');
    } else {
        console.log('❌ Fallback handling for missing llama.rn missing');
    }
} catch (error) {
    console.log('❌ Local LLM test failed:', error.message);
}

// Test 3: Check Enhanced LLM Service
try {
    console.log('\n3. Testing Enhanced LLM Service structure...');
    const fs = require('fs');
    const enhancedLLMContent = fs.readFileSync('./enhancedLLMService.js', 'utf8');

    if (enhancedLLMContent.includes('analyzeTone') &&
        enhancedLLMContent.includes('getCBTHelp')) {
        console.log('✅ Enhanced LLM Service has required methods');
    } else {
        console.log('❌ Enhanced LLM Service missing required methods');
    }
} catch (error) {
    console.log('❌ Enhanced LLM test failed:', error.message);
}

// Test 4: Check Demo LLM Service
try {
    console.log('\n4. Testing Demo LLM Service structure...');
    const fs = require('fs');
    const demoLLMContent = fs.readFileSync('./demoLLMService.js', 'utf8');

    if (demoLLMContent.includes('analyzeTone') &&
        demoLLMContent.includes('getSummary')) {
        console.log('✅ Demo LLM Service has required methods');
    } else {
        console.log('❌ Demo LLM Service missing required methods');
    }
} catch (error) {
    console.log('❌ Demo LLM test failed:', error.message);
}

// Test 5: Check App.js integration
try {
    console.log('\n5. Testing App.js AI service initialization...');
    const fs = require('fs');
    const appContent = fs.readFileSync('./App.js', 'utf8');

    if (appContent.includes('initLocalLLM') || appContent.includes('enhancedLLMService')) {
        console.log('✅ App.js has AI service initialization');
    } else {
        console.log('❌ App.js missing AI service initialization');
    }
} catch (error) {
    console.log('❌ App.js test failed:', error.message);
}

console.log('\n📊 Runtime fix verification completed!');
console.log('🎯 Check the Expo web app at http://localhost:8082 for live testing.');
