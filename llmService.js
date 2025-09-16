// llmService.js
// Service for loading and running the LLM for emotion analysis

import modelManager from './modelManager';

// Conditionally import LlamaContext to avoid native module errors
let LlamaContext = null;
try {
  const llamaModule = require('llama.rn');
  LlamaContext = llamaModule.LlamaContext;
} catch (error) {
  console.warn('llama.rn not available, will use demo mode:', error.message);
}

class LLMService {
  constructor() {
    this.context = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.demoMode = false; // Enable demo mode for testing without model
  }

  // Enable demo mode for testing
  enableDemoMode() {
    this.demoMode = true;
    this.isInitialized = true;
    console.log('LLM Demo Mode enabled - simulating AI analysis');
  }

  // Disable demo mode
  disableDemoMode() {
    this.demoMode = false;
    this.isInitialized = false;
  }

  // Initialize the LLM context with the downloaded model
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (this.isInitializing) {
      // Wait for ongoing initialization
      return new Promise((resolve) => {
        const checkInit = () => {
          if (this.isInitialized || !this.isInitializing) {
            resolve(this.isInitialized);
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    // Check if llama.rn is available
    if (!LlamaContext) {
      console.log('llama.rn not available, enabling demo mode');
      this.enableDemoMode();
      return true;
    }

    // Check if demo mode should be enabled (for development)
    if (process.env.NODE_ENV === 'development' && !await modelManager.isModelDownloaded()) {
      console.log('Development mode: Enabling LLM demo mode');
      this.enableDemoMode();
      return true;
    }

    try {
      this.isInitializing = true;

      // Check if model is downloaded
      const isModelReady = await modelManager.isModelDownloaded();
      if (!isModelReady) {
        console.log('Model not downloaded, enabling demo mode');
        this.enableDemoMode();
        return true;
      }

      // Validate model
      const validation = await modelManager.validateModel();
      if (!validation.valid) {
        console.log(`Model validation failed: ${validation.reason}, enabling demo mode`);
        this.enableDemoMode();
        return true;
      }

      const modelInfo = await modelManager.getModelInfo();
      console.log('Initializing LLM with model:', modelInfo.path);

      // Initialize LlamaContext
      this.context = await LlamaContext.initFromFile(modelInfo.path, {
        n_ctx: 512, // Context window size
        n_threads: 2, // Number of threads for processing
        use_mlock: false, // Memory locking (disable on mobile)
        use_mmap: true, // Memory mapping for efficiency
      });

      this.isInitialized = true;
      this.demoMode = false;
      console.log('LLM initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize LLM:', error);
      this.isInitialized = false;
      
      // Fall back to demo mode
      console.log('Falling back to demo mode due to initialization failure');
      this.enableDemoMode();
      return true;
      
    } finally {
      this.isInitializing = false;
    }
  }

  // Clean up and release resources
  async cleanup() {
    if (this.context) {
      try {
        await this.context.release();
        this.context = null;
        this.isInitialized = false;
        console.log('LLM context released');
      } catch (error) {
        console.error('Error releasing LLM context:', error);
      }
    }
  }

  // Analyze emotion in text using the LLM or demo mode
  async analyzeEmotion(text) {
    if (!this.isInitialized) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      return {
        tone: 'neutral',
        confidence: 0.5,
        explanation: 'Empty message detected',
        source: 'llm',
        demo: this.demoMode
      };
    }

    try {
      // Demo mode - simulate LLM analysis
      if (this.demoMode) {
        return this.simulateEmotionAnalysis(text);
      }

      // Real LLM analysis
      const prompt = this.createEmotionPrompt(text);
      
      // Generate response from LLM
      const response = await this.context.completion(prompt, {
        n_predict: 100, // Max tokens to generate
        temperature: 0.3, // Lower temperature for more consistent results
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1,
        stop: ['\n', '###', 'Human:', 'Assistant:'], // Stop sequences
      });

      // Parse the LLM response
      const analysis = this.parseEmotionResponse(response.text, text);
      
      return {
        ...analysis,
        source: 'llm',
        demo: false,
        rawResponse: response.text.trim()
      };

    } catch (error) {
      console.error('Emotion analysis failed:', error);
      
      // Fallback to basic keyword analysis
      return this.fallbackEmotionAnalysis(text);
    }
  }

  // Simulate LLM emotion analysis for demo mode
  simulateEmotionAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Enhanced simulation that considers context and sentiment
    let emotion = 'neutral';
    let confidence = 0.75;
    let explanation = '';

    // Positive emotions
    if (lowerText.includes('excited') || lowerText.includes('amazing') || 
        lowerText.includes('love') || lowerText.includes('wonderful') ||
        lowerText.includes('great') || lowerText.includes('awesome')) {
      emotion = 'excited';
      confidence = 0.85 + Math.random() * 0.1;
      explanation = 'Detected high-energy positive emotions and enthusiasm';
    }
    // Anger indicators
    else if (lowerText.includes('angry') || lowerText.includes('mad') || 
             lowerText.includes('furious') || lowerText.includes('annoyed') ||
             text.includes('!!') || (text.includes('!') && text.length < 30)) {
      emotion = 'angry';
      confidence = 0.8 + Math.random() * 0.15;
      explanation = 'Detected frustration, irritation, or strong negative emotions';
    }
    // Stress/anxiety indicators
    else if (lowerText.includes('stress') || lowerText.includes('worried') || 
             lowerText.includes('anxious') || lowerText.includes('overwhelmed') ||
             lowerText.includes('tired') || lowerText.includes('difficult')) {
      emotion = 'stressed';
      confidence = 0.78 + Math.random() * 0.12;
      explanation = 'Detected stress, worry, or feelings of being overwhelmed';
    }
    // Subtle positive indicators
    else if (lowerText.includes('good') || lowerText.includes('happy') || 
             lowerText.includes('nice') || lowerText.includes('thanks')) {
      emotion = 'excited';
      confidence = 0.7 + Math.random() * 0.15;
      explanation = 'Detected positive sentiment and satisfaction';
    }
    // Neutral with context
    else {
      confidence = 0.6 + Math.random() * 0.2;
      explanation = 'Balanced tone without strong emotional indicators';
    }

    return {
      tone: emotion,
      confidence: Math.min(confidence, 0.95), // Cap confidence
      explanation: `[Demo AI] ${explanation}`,
      source: 'llm',
      demo: true
    };
  }

  // Create a structured prompt for emotion analysis
  createEmotionPrompt(text) {
    return `Analyze the emotional tone of this message and respond with ONLY the following format:

EMOTION: [angry/stressed/neutral/excited]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [brief explanation]

Message to analyze: "${text}"

Response:`;
  }

  // Parse the LLM's emotion analysis response
  parseEmotionResponse(response, originalText) {
    try {
      const lines = response.split('\n').filter(line => line.trim());
      
      let emotion = 'neutral';
      let confidence = 0.7;
      let explanation = 'Basic emotion detected';

      // Parse structured response
      for (const line of lines) {
        const trimmed = line.trim().toUpperCase();
        
        if (trimmed.startsWith('EMOTION:')) {
          const emotionMatch = trimmed.match(/EMOTION:\s*(\w+)/);
          if (emotionMatch) {
            const detectedEmotion = emotionMatch[1].toLowerCase();
            // Map to our 4 core emotions
            if (['angry', 'stressed', 'neutral', 'excited'].includes(detectedEmotion)) {
              emotion = detectedEmotion;
            } else {
              // Map alternative emotions
              emotion = this.mapToCore(detectedEmotion);
            }
          }
        }
        
        if (trimmed.startsWith('CONFIDENCE:')) {
          const confMatch = trimmed.match(/CONFIDENCE:\s*([\d.]+)/);
          if (confMatch) {
            const conf = parseFloat(confMatch[1]);
            if (conf >= 0 && conf <= 1) {
              confidence = conf;
            }
          }
        }
        
        if (trimmed.startsWith('EXPLANATION:')) {
          explanation = line.substring(line.indexOf(':') + 1).trim();
        }
      }

      return {
        tone: emotion,
        confidence: confidence,
        explanation: explanation
      };

    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return this.fallbackEmotionAnalysis(originalText);
    }
  }

  // Map alternative emotions to our 4 core emotions
  mapToCore(emotion) {
    const emotionMap = {
      // Positive emotions -> excited
      'happy': 'excited',
      'joy': 'excited',
      'positive': 'excited',
      'cheerful': 'excited',
      'enthusiastic': 'excited',
      'elated': 'excited',
      'content': 'excited',
      
      // Negative high-energy -> angry
      'frustrated': 'angry',
      'irritated': 'angry',
      'annoyed': 'angry',
      'furious': 'angry',
      'mad': 'angry',
      
      // Negative low-energy -> stressed
      'sad': 'stressed',
      'worried': 'stressed',
      'anxious': 'stressed',
      'overwhelmed': 'stressed',
      'depressed': 'stressed',
      'melancholy': 'stressed',
      'disappointed': 'stressed',
      
      // Default to neutral
      'calm': 'neutral',
      'balanced': 'neutral',
      'composed': 'neutral',
    };

    return emotionMap[emotion] || 'neutral';
  }

  // Fallback emotion analysis using simple keywords
  fallbackEmotionAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based analysis as fallback
    if (lowerText.includes('love') || lowerText.includes('happy') || lowerText.includes('great') || 
        lowerText.includes('wonderful') || lowerText.includes('amazing') || lowerText.includes('excited')) {
      return {
        tone: 'excited',
        confidence: 0.75,
        explanation: 'Detected positive enthusiasm in message'
      };
    }
    
    if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad') || 
        lowerText.includes('annoyed') || lowerText.includes('!')) {
      return {
        tone: 'angry',
        confidence: 0.7,
        explanation: 'Detected frustration or anger in message'
      };
    }
    
    if (lowerText.includes('stress') || lowerText.includes('worried') || lowerText.includes('sad') || 
        lowerText.includes('overwhelmed') || lowerText.includes('anxious')) {
      return {
        tone: 'stressed',
        confidence: 0.75,
        explanation: 'Detected stress or worry in message'
      };
    }
    
    return {
      tone: 'neutral',
      confidence: 0.6,
      explanation: 'Neutral tone detected (fallback analysis)'
    };
  }

  // Check if LLM is ready for use
  isReady() {
    return this.isInitialized && this.context !== null;
  }

  // Get status information
  getStatus() {
    return {
      initialized: this.isInitialized,
      initializing: this.isInitializing,
      contextReady: this.context !== null,
      demoMode: this.demoMode,
      llamaAvailable: LlamaContext !== null
    };
  }

  // Reinitialize if needed
  async reinitialize() {
    await this.cleanup();
    return await this.initialize();
  }
}

// Export singleton instance
export default new LLMService();
