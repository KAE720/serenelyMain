// TestLLMScreen.js
// Screen to test LLM functionality without breaking the main app

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import enhancedToneAnalysisService from './services/enhancedToneAnalysisService';

export default function TestLLMScreen({ onBack }) {
  const [testText, setTestText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      console.log('Initializing enhanced tone analysis service...');
      const initialized = await enhancedToneAnalysisService.initializeLLM();
      setIsInitialized(initialized);
      
      const status = await enhancedToneAnalysisService.getModelStatus();
      setServiceStatus(status);
      
      console.log('Service initialization complete:', { initialized, status });
    } catch (error) {
      console.error('Failed to initialize service:', error);
      Alert.alert('Initialization Error', error.message);
    }
  };

  const testAnalysis = async () => {
    if (!testText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setLoading(true);
    try {
      console.log('Analyzing text:', testText);
      const analysis = await enhancedToneAnalysisService.analyzeTone(testText);
      
      const result = {
        id: Date.now(),
        text: testText,
        analysis: analysis,
        timestamp: new Date().toLocaleString()
      };
      
      setResults(prev => [result, ...prev]);
      setTestText('');
      
      console.log('Analysis result:', analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Analysis Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSamples = [
    "I'm so excited about this new project!",
    "I'm feeling really stressed about deadlines.",
    "This is making me angry and frustrated.",
    "Just a normal day at work.",
    "I love working with this team!"
  ];

  const runSampleTest = async (sampleText) => {
    setTestText(sampleText);
    setTimeout(() => testAnalysis(), 100);
  };

  const getEmotionColor = (tone) => {
    const colors = {
      angry: "#A1232B",
      stressed: "#D9772B", 
      neutral: "#4A90A4",
      excited: "#4CAF50",
      happy: "#4CAF50"
    };
    return colors[tone] || "#4A90A4";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LLM Test Screen</Text>
      </View>

      {/* Service Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Status</Text>
        <Text style={styles.statusText}>
          Initialized: {isInitialized ? '✅' : '❌'}
        </Text>
        {serviceStatus && (
          <>
            <Text style={styles.statusText}>
              Model Downloaded: {serviceStatus.downloaded ? '✅' : '❌'}
            </Text>
            <Text style={styles.statusText}>
              LLM Ready: {serviceStatus.llmReady ? '✅' : '❌'}
            </Text>
            <Text style={styles.statusText}>
              Storage Sufficient: {serviceStatus.storageInfo?.sufficient ? '✅' : '❌'}
            </Text>
          </>
        )}
      </View>

      {/* Test Input */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Test Emotion Analysis</Text>
        <TextInput
          style={styles.input}
          value={testText}
          onChangeText={setTestText}
          placeholder="Enter text to analyze emotion..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]}
          onPress={testAnalysis}
          disabled={loading || !testText.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Analyzing...' : 'Analyze Emotion'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sample Tests */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Tests</Text>
        {testSamples.map((sample, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sampleButton}
            onPress={() => runSampleTest(sample)}
          >
            <Text style={styles.sampleText}>"{sample}"</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Analysis Results</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No results yet. Try analyzing some text!</Text>
        ) : (
          results.map((result) => (
            <View key={result.id} style={styles.resultItem}>
              <Text style={styles.resultText}>"{result.text}"</Text>
              <View style={[
                styles.emotionBadge, 
                { backgroundColor: getEmotionColor(result.analysis.tone) }
              ]}>
                <Text style={styles.emotionText}>
                  {result.analysis.tone.toUpperCase()}
                </Text>
                <Text style={styles.confidenceText}>
                  {Math.round((result.analysis.confidence || 0) * 100)}%
                </Text>
              </View>
              <Text style={styles.methodText}>
                Method: {result.analysis.method || 'unknown'}
                {result.analysis.enhanced ? ' (Enhanced)' : ''}
                {result.analysis.demo ? ' (Demo)' : ''}
              </Text>
              <Text style={styles.explanationText}>
                {result.analysis.explanation}
              </Text>
              <Text style={styles.timestampText}>{result.timestamp}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90A4',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 120,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4A90A4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sampleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sampleText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  emotionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  confidenceText: {
    color: 'white',
    fontSize: 11,
    opacity: 0.9,
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 11,
    color: '#999',
  },
});
