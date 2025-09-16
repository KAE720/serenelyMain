// ModelManagementScreen.js
// Screen for managing AI model download and storage

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import enhancedToneAnalysisService from './services/enhancedToneAnalysisService';

export default function ModelManagementScreen({ onBack }) {
  const [modelStatus, setModelStatus] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load model status on component mount
  useEffect(() => {
    loadModelStatus();
    
    // Add progress callback
    const progressCallback = (progress) => {
      setDownloadProgress(progress);
    };
    
    enhancedToneAnalysisService.addProgressCallback(progressCallback);
    
    // Cleanup
    return () => {
      enhancedToneAnalysisService.removeProgressCallback(progressCallback);
    };
  }, []);

  const loadModelStatus = async () => {
    try {
      setLoading(true);
      const status = await enhancedToneAnalysisService.getModelStatus();
      setModelStatus(status);
      setDownloading(status.isDownloading);
      setDownloadProgress(status.downloadProgress);
    } catch (error) {
      console.error('Failed to load model status:', error);
      Alert.alert('Error', 'Failed to load model status');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    try {
      // Check storage space first
      const storageInfo = await enhancedToneAnalysisService.getStorageInfo();
      
      if (!storageInfo.sufficient) {
        Alert.alert(
          'Insufficient Storage',
          `You need at least ${storageInfo.requiredMB}MB of free space. You have ${storageInfo.availableMB}MB available.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Confirm download
      Alert.alert(
        'Download AI Model',
        `This will download a ${storageInfo.requiredMB}MB AI model for enhanced emotion analysis. The download may take several minutes depending on your connection.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              setDownloading(true);
              setDownloadProgress(0);
              
              try {
                await enhancedToneAnalysisService.downloadModel((progress) => {
                  setDownloadProgress(progress);
                });
                
                Alert.alert('Success', 'AI model downloaded successfully! Enhanced emotion analysis is now available.');
                await loadModelStatus();
              } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Download Failed', error.message);
              } finally {
                setDownloading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to initiate download:', error);
      Alert.alert('Error', 'Failed to start download');
    }
  };

  const handleDeleteModel = async () => {
    Alert.alert(
      'Delete AI Model',
      'This will delete the downloaded AI model and free up storage space. You can download it again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await enhancedToneAnalysisService.deleteModel();
              Alert.alert('Success', 'AI model deleted successfully');
              await loadModelStatus();
            } catch (error) {
              console.error('Failed to delete model:', error);
              Alert.alert('Error', 'Failed to delete model');
            }
          }
        }
      ]
    );
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Model Management</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4A90A4" />
          <Text style={styles.loadingText}>Loading model status...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Model Management</Text>
      </View>

      <View style={styles.content}>
        {/* Model Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Model Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              { color: modelStatus?.downloaded ? '#4CAF50' : '#D9772B' }
            ]}>
              {modelStatus?.downloaded ? 'Downloaded' : 'Not Downloaded'}
            </Text>
          </View>

          {modelStatus?.downloaded && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Size:</Text>
                <Text style={styles.statusValue}>
                  {formatBytes(modelStatus.modelInfo.size)}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Enhanced Analysis:</Text>
                <Text style={[
                  styles.statusValue,
                  { color: modelStatus.llmReady ? '#4CAF50' : '#D9772B' }
                ]}>
                  {modelStatus.llmReady ? 'Available' : 'Initializing...'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Storage Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Storage Information</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Available Space:</Text>
            <Text style={styles.statusValue}>
              {formatBytes(modelStatus?.storageInfo.available || 0)}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Required Space:</Text>
            <Text style={styles.statusValue}>
              {modelStatus?.storageInfo.requiredMB || 400}MB
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Space Check:</Text>
            <Text style={[
              styles.statusValue,
              { color: modelStatus?.storageInfo.sufficient ? '#4CAF50' : '#A1232B' }
            ]}>
              {modelStatus?.storageInfo.sufficient ? 'Sufficient' : 'Insufficient'}
            </Text>
          </View>
        </View>

        {/* Download Progress */}
        {downloading && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Download Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${downloadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(downloadProgress)}%
              </Text>
            </View>
            <Text style={styles.progressSubtext}>
              Downloading AI model for enhanced emotion analysis...
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!modelStatus?.downloaded && !downloading && (
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.downloadButton,
                !modelStatus?.storageInfo.sufficient && styles.disabledButton
              ]}
              onPress={handleDownloadModel}
              disabled={!modelStatus?.storageInfo.sufficient}
            >
              <Text style={styles.buttonText}>
                Download AI Model (400MB)
              </Text>
            </TouchableOpacity>
          )}

          {modelStatus?.downloaded && !downloading && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteModel}
            >
              <Text style={styles.buttonText}>
                Delete AI Model
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]}
            onPress={loadModelStatus}
          >
            <Text style={styles.buttonText}>
              Refresh Status
            </Text>
          </TouchableOpacity>
        </View>

        {/* Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About AI Enhanced Analysis</Text>
          <Text style={styles.infoText}>
            The AI model provides more accurate and nuanced emotion analysis compared to basic keyword matching. 
            Once downloaded, the model runs entirely on your device for privacy and works offline.
          </Text>
          <Text style={styles.infoText}>
            • More accurate emotion detection{'\n'}
            • Works offline{'\n'}
            • Complete privacy (on-device processing){'\n'}
            • Supports 4 core emotions: Angry, Stressed, Neutral, Excited
          </Text>
        </View>
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
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90A4',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  actionButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#A1232B',
  },
  refreshButton: {
    backgroundColor: '#4A90A4',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
});
