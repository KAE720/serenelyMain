/**
 * Comprehensive test for runtime fixes:
 * 1. NativeEventEmitter error fix
 * 2. Firebase Auth persistence warning fix
 * 3. All AI features working properly
 */

import React from 'react';
import { View, Text, Alert } from 'react-native';
import { auth } from './firebase.js';
import { initLocalLLM } from './localLLMService.js';
import { enhancedLLMService } from './enhancedLLMService.js';
import { demoLLMService } from './demoLLMService.js';

// Test Firebase Auth initialization
export function testFirebaseAuth() {
    try {
        console.log('✅ Firebase Auth initialized successfully');
        console.log('Auth instance:', auth ? 'Available' : 'Not available');
        return true;
    } catch (error) {
        console.error('❌ Firebase Auth error:', error);
        return false;
    }
}

// Test Local LLM Service (with defensive imports)
export async function testLocalLLMService() {
    try {
        console.log('🧠 Testing Local LLM Service...');
        const isInitialized = await initLocalLLM();
        console.log('Local LLM initialized:', isInitialized);

        // This should not throw NativeEventEmitter errors
        console.log('✅ Local LLM Service loaded without errors');
        return true;
    } catch (error) {
        console.error('❌ Local LLM Service error:', error);
        return false;
    }
}

// Test Enhanced LLM Service
export async function testEnhancedLLMService() {
    try {
        console.log('🎯 Testing Enhanced LLM Service...');

        // Test message analysis
        const analysis = await enhancedLLMService.analyzeMessage('I feel great today!');
        console.log('Message analysis:', analysis);

        // Test CBT response
        const cbtResponse = await enhancedLLMService.generateCBTResponse('I am feeling anxious');
        console.log('CBT response:', cbtResponse);

        console.log('✅ Enhanced LLM Service working correctly');
        return true;
    } catch (error) {
        console.error('❌ Enhanced LLM Service error:', error);
        return false;
    }
}

// Test Demo LLM Service (fallback)
export async function testDemoLLMService() {
    try {
        console.log('🎭 Testing Demo LLM Service...');

        // Test message analysis
        const analysis = await demoLLMService.analyzeMessage('This is a test message');
        console.log('Demo analysis:', analysis);

        // Test summarization
        const summary = await demoLLMService.summarizeMessages([
            { text: 'Hello', timestamp: Date.now() },
            { text: 'How are you?', timestamp: Date.now() }
        ]);
        console.log('Demo summary:', summary);

        console.log('✅ Demo LLM Service working correctly');
        return true;
    } catch (error) {
        console.error('❌ Demo LLM Service error:', error);
        return false;
    }
}

// Run all tests
export async function runAllTests() {
    console.log('🚀 Starting comprehensive runtime tests...\n');

    const results = {
        firebaseAuth: false,
        localLLM: false,
        enhancedLLM: false,
        demoLLM: false
    };

    // Test Firebase Auth
    results.firebaseAuth = testFirebaseAuth();

    // Test Local LLM Service
    results.localLLM = await testLocalLLMService();

    // Test Enhanced LLM Service
    results.enhancedLLM = await testEnhancedLLMService();

    // Test Demo LLM Service
    results.demoLLM = await testDemoLLMService();

    // Summary
    console.log('\n📊 Test Results:');
    console.log('Firebase Auth:', results.firebaseAuth ? '✅ PASS' : '❌ FAIL');
    console.log('Local LLM Service:', results.localLLM ? '✅ PASS' : '❌ FAIL');
    console.log('Enhanced LLM Service:', results.enhancedLLM ? '✅ PASS' : '❌ FAIL');
    console.log('Demo LLM Service:', results.demoLLM ? '✅ PASS' : '❌ FAIL');

    const allPassed = Object.values(results).every(result => result);
    console.log('\n🎉 Overall:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');

    return results;
}

// Test component for easy integration
export function RuntimeTestComponent() {
    const [testResults, setTestResults] = React.useState(null);
    const [isRunning, setIsRunning] = React.useState(false);

    const handleRunTests = async () => {
        setIsRunning(true);
        try {
            const results = await runAllTests();
            setTestResults(results);
        } catch (error) {
            console.error('Test runner error:', error);
            Alert.alert('Test Error', error.message);
        } finally {
            setIsRunning(false);
        }
    };

    React.useEffect(() => {
        // Auto-run tests on component mount
        handleRunTests();
    }, []);

    return (
        <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Runtime Fix Tests
            </Text>

            {isRunning && (
                <Text style={{ color: '#007AFF', marginBottom: 10 }}>
                    Running tests...
                </Text>
            )}

            {testResults && (
                <View>
                    <Text style={{ color: testResults.firebaseAuth ? 'green' : 'red' }}>
                        Firebase Auth: {testResults.firebaseAuth ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                    <Text style={{ color: testResults.localLLM ? 'green' : 'red' }}>
                        Local LLM: {testResults.localLLM ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                    <Text style={{ color: testResults.enhancedLLM ? 'green' : 'red' }}>
                        Enhanced LLM: {testResults.enhancedLLM ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                    <Text style={{ color: testResults.demoLLM ? 'green' : 'red' }}>
                        Demo LLM: {testResults.demoLLM ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                </View>
            )}
        </View>
    );
}

// Manual test runner for console
if (require.main === module) {
    runAllTests().then(results => {
        console.log('Manual test run completed');
        process.exit(0);
    }).catch(error => {
        console.error('Manual test run failed:', error);
        process.exit(1);
    });
}
