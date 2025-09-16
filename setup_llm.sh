#!/bin/bash
# Quick Setup Script for On-Device LLM Implementation
# Run this script to install dependencies and configure the project

echo "🚀 Setting up On-Device LLM for Emotion Analysis..."

# Install required dependencies
echo "📦 Installing dependencies..."
npm install llama.rn react-native-fs react-native-progress

# Install iOS dependencies
if [ -d "ios" ]; then
    echo "🍎 Installing iOS dependencies..."
    cd ios && pod install && cd ..
fi

# Create metro config if it doesn't exist
if [ ! -f "metro.config.js" ]; then
    echo "📝 Creating metro.config.js..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for GGUF model files
config.resolver.assetExts.push('gguf', 'ggml', 'bin');

module.exports = config;
EOF
fi

# Create model directory if it doesn't exist
mkdir -p assets/models

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Build and run the app to test demo mode"
echo "2. Use the model download feature to get Phi-3 Mini"
echo "3. Test real LLM analysis after model download"
echo ""
echo "Demo mode is enabled by default for testing without a model."
echo "The LLM will automatically initialize when a model is available."
