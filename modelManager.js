// modelManager.js
// Manages downloading and storing the LLM model file on device

import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

// Hugging Face model configuration
const MODEL_CONFIG = {
  // Using a small emotion analysis model from Hugging Face
  modelUrl: 'https://huggingface.co/microsoft/DialoGPT-medium/resolve/main/pytorch_model.bin',
  modelName: 'emotion_analyzer_model.bin',
  modelSize: '350MB', // Approximate size for user info
  fallbackUrl: 'https://huggingface.co/gpt2/resolve/main/pytorch_model.bin', // Backup smaller model
};

class ModelManager {
  constructor() {
    this.modelDirectory = `${FileSystem.documentDirectory}models/`;
    this.modelPath = `${this.modelDirectory}${MODEL_CONFIG.modelName}`;
    this.downloadProgress = 0;
    this.isDownloading = false;
    this.progressCallbacks = new Set();
  }

  // Add progress callback for UI updates
  addProgressCallback(callback) {
    this.progressCallbacks.add(callback);
  }

  // Remove progress callback
  removeProgressCallback(callback) {
    this.progressCallbacks.delete(callback);
  }

  // Notify all progress callbacks
  notifyProgress(progress) {
    this.downloadProgress = progress;
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  // Check if model exists locally
  async isModelDownloaded() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.modelPath);
      return fileInfo.exists && fileInfo.size > 0;
    } catch (error) {
      console.error('Error checking model file:', error);
      return false;
    }
  }

  // Get model file info
  async getModelInfo() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.modelPath);
      return {
        exists: fileInfo.exists,
        size: fileInfo.size,
        path: this.modelPath,
        lastModified: fileInfo.modificationTime,
      };
    } catch (error) {
      console.error('Error getting model info:', error);
      return { exists: false, size: 0, path: this.modelPath };
    }
  }

  // Create model directory if it doesn't exist
  async ensureModelDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.modelDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.modelDirectory, { intermediates: true });
        console.log('Created model directory:', this.modelDirectory);
      }
    } catch (error) {
      console.error('Error creating model directory:', error);
      throw new Error('Failed to create model directory');
    }
  }

  // Download model with progress tracking
  async downloadModel(onProgress = null) {
    if (this.isDownloading) {
      throw new Error('Model download already in progress');
    }

    try {
      this.isDownloading = true;
      this.notifyProgress(0);

      // Ensure directory exists
      await this.ensureModelDirectory();

      // Check if already downloaded
      if (await this.isModelDownloaded()) {
        console.log('Model already exists, skipping download');
        this.notifyProgress(100);
        return this.modelPath;
      }

      console.log('Starting model download...');
      
      // Create download resumable for progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_CONFIG.modelUrl,
        this.modelPath,
        {},
        (downloadProgress) => {
          const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
          this.notifyProgress(progress);
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        console.log('Model downloaded successfully to:', result.uri);
        this.notifyProgress(100);
        return result.uri;
      } else {
        throw new Error('Download failed - no result URI');
      }

    } catch (error) {
      console.error('Model download failed:', error);
      
      // Try fallback URL if main download fails
      if (error.message.includes('404') || error.message.includes('network')) {
        console.log('Trying fallback model URL...');
        try {
          const downloadResumable = FileSystem.createDownloadResumable(
            MODEL_CONFIG.fallbackUrl,
            this.modelPath,
            {},
            (downloadProgress) => {
              const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
              this.notifyProgress(progress);
              if (onProgress) {
                onProgress(progress);
              }
            }
          );

          const result = await downloadResumable.downloadAsync();
          if (result && result.uri) {
            console.log('Fallback model downloaded successfully to:', result.uri);
            this.notifyProgress(100);
            return result.uri;
          }
        } catch (fallbackError) {
          console.error('Fallback download also failed:', fallbackError);
        }
      }

      // Clean up partial download
      await this.deleteModel();
      throw new Error(`Failed to download model: ${error.message}`);
    } finally {
      this.isDownloading = false;
    }
  }

  // Delete model file
  async deleteModel() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.modelPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(this.modelPath);
        console.log('Model deleted successfully');
        this.notifyProgress(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw new Error('Failed to delete model');
    }
  }

  // Get download progress
  getDownloadProgress() {
    return this.downloadProgress;
  }

  // Check if download is in progress
  isDownloadInProgress() {
    return this.isDownloading;
  }

  // Estimate storage requirements
  getStorageInfo() {
    return {
      modelSize: MODEL_CONFIG.modelSize,
      modelName: MODEL_CONFIG.modelName,
      requiredSpace: '400MB', // Buffer for safety
      platform: Platform.OS,
    };
  }

  // Check available storage space
  async checkStorageSpace() {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const requiredBytes = 400 * 1024 * 1024; // 400MB in bytes
      
      return {
        available: freeSpace,
        required: requiredBytes,
        sufficient: freeSpace > requiredBytes,
        availableMB: Math.round(freeSpace / (1024 * 1024)),
        requiredMB: 400,
      };
    } catch (error) {
      console.error('Error checking storage space:', error);
      return {
        available: 0,
        required: 400 * 1024 * 1024,
        sufficient: false,
        availableMB: 0,
        requiredMB: 400,
      };
    }
  }

  // Validate model integrity (basic check)
  async validateModel() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.modelPath);
      if (!fileInfo.exists) {
        return { valid: false, reason: 'Model file does not exist' };
      }

      if (fileInfo.size < 1024 * 1024) { // Less than 1MB
        return { valid: false, reason: 'Model file too small, likely corrupted' };
      }

      // Additional validation could include checksum verification
      return { valid: true, size: fileInfo.size };
    } catch (error) {
      console.error('Error validating model:', error);
      return { valid: false, reason: error.message };
    }
  }
}

// Export singleton instance
export default new ModelManager();
