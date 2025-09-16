// services/enhancedToneAnalysisService.js
// Enhanced tone analysis service that combines LLM and fallback methods

import llmService from '../llmService';
import modelManager from '../modelManager';
import { analyzeTone as fallbackAnalyzeTone, getToneSuggestions } from './toneAnalysisService';

class EnhancedToneAnalysisService {
  constructor() {
    this.isLLMReady = false;
    this.isInitializing = false;
    this.initializationPromise = null;
  }

  // Initialize the LLM service (should be called on app start)
  async initializeLLM() {
    if (this.isLLMReady) {
      return true;
    }

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._performInitialization();
    
    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  async _performInitialization() {
    try {
      // Always try to initialize, even if model isn't downloaded
      // The LLM service will handle fallbacks gracefully
      await llmService.initialize();
      
      // Check if we're in demo mode or real LLM mode
      const status = llmService.getStatus();
      this.isLLMReady = status.initialized;
      
      if (status.initialized) {
        console.log('Enhanced tone analysis ready:', llmService.demoMode ? 'Demo mode' : 'LLM mode');
      } else {
        console.log('Enhanced tone analysis using fallback mode');
      }
      
      return true;

    } catch (error) {
      console.error('Failed to initialize LLM for tone analysis:', error);
      this.isLLMReady = false;
      return false;
    }
  }

  // Main analyze tone method - uses LLM if available, falls back to keywords
  async analyzeTone(text) {
    try {
      // Try LLM analysis first if available
      if (this.isLLMReady && llmService.isReady()) {
        console.log('Using LLM for emotion analysis');
        const llmResult = await llmService.analyzeEmotion(text);
        
        // Enhance with additional metadata
        return {
          ...llmResult,
          method: 'llm',
          enhanced: true,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('LLM analysis failed, falling back to keyword analysis:', error);
    }

    // Fallback to keyword-based analysis
    console.log('Using fallback keyword analysis');
    const fallbackResult = await fallbackAnalyzeTone(text);
    
    return {
      ...fallbackResult,
      method: 'keyword',
      enhanced: false,
      timestamp: new Date().toISOString()
    };
  }

  // Check if model is downloaded and ready
  async isModelReady() {
    return await modelManager.isModelDownloaded();
  }

  // Get model download status
  async getModelStatus() {
    const isDownloaded = await modelManager.isModelDownloaded();
    const modelInfo = await modelManager.getModelInfo();
    const storageInfo = await modelManager.checkStorageSpace();
    
    return {
      downloaded: isDownloaded,
      modelInfo,
      storageInfo,
      llmReady: this.isLLMReady,
      downloadProgress: modelManager.getDownloadProgress(),
      isDownloading: modelManager.isDownloadInProgress()
    };
  }

  // Download model with progress tracking
  async downloadModel(onProgress = null) {
    try {
      // Check storage space first
      const storageInfo = await modelManager.checkStorageSpace();
      if (!storageInfo.sufficient) {
        throw new Error(`Insufficient storage space. Need ${storageInfo.requiredMB}MB, have ${storageInfo.availableMB}MB`);
      }

      const modelPath = await modelManager.downloadModel(onProgress);
      
      // Try to initialize LLM after download
      await this.initializeLLM();
      
      return modelPath;
    } catch (error) {
      console.error('Model download failed:', error);
      throw error;
    }
  }

  // Delete model and cleanup
  async deleteModel() {
    try {
      // Cleanup LLM service first
      if (this.isLLMReady) {
        await llmService.cleanup();
        this.isLLMReady = false;
      }

      // Delete model file
      await modelManager.deleteModel();
      
      return true;
    } catch (error) {
      console.error('Failed to delete model:', error);
      throw error;
    }
  }

  // Get storage information
  async getStorageInfo() {
    return await modelManager.checkStorageSpace();
  }

  // Add download progress callback
  addProgressCallback(callback) {
    modelManager.addProgressCallback(callback);
  }

  // Remove download progress callback
  removeProgressCallback(callback) {
    modelManager.removeProgressCallback(callback);
  }

  // Get tone suggestions (unchanged from original service)
  async getToneSuggestions(tone, message) {
    return await getToneSuggestions(tone, message);
  }

  // Get service status for debugging
  getServiceStatus() {
    return {
      llmReady: this.isLLMReady,
      isInitializing: this.isInitializing,
      llmStatus: llmService.getStatus(),
      modelDownloadProgress: modelManager.getDownloadProgress(),
      isDownloading: modelManager.isDownloadInProgress()
    };
  }

  // Reinitialize the service
  async reinitialize() {
    this.isLLMReady = false;
    return await this.initializeLLM();
  }
}

// Export singleton instance
export default new EnhancedToneAnalysisService();
