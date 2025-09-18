#!/bin/bash

# Phi-2 Model Setup Script for iOS React Native App
# This script downloads the quantized Phi-2 model for local inference

echo "🧠 Setting up Phi-2 model for local inference..."

# Create assets/models directory
mkdir -p assets/models

# Check if model already exists
if [ -f "assets/models/phi-2.Q4_K_M.gguf" ]; then
    echo "✅ Phi-2 model already exists!"
    exit 0
fi

echo "📥 Downloading Phi-2 Q4_K_M model (~1.5GB)..."
echo "This may take a few minutes depending on your internet connection..."

# Download the model using curl
curl -L -o assets/models/phi-2.Q4_K_M.gguf \
  "https://huggingface.co/microsoft/phi-2-gguf/resolve/main/phi-2.Q4_K_M.gguf"

# Check if download was successful
if [ $? -eq 0 ] && [ -f "assets/models/phi-2.Q4_K_M.gguf" ]; then
    echo "✅ Phi-2 model downloaded successfully!"
    echo "📊 Model size: $(du -h assets/models/phi-2.Q4_K_M.gguf | cut -f1)"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run 'npm install llama.rn@0.6.15' if not already installed"
    echo "2. For iOS: 'cd ios && pod install'"
    echo "3. Run 'expo start' and test on iOS simulator or device"
    echo ""
    echo "⚠️  Performance notes:"
    echo "- iPhone 12+ recommended for best performance"
    echo "- Expect 2-5 second inference times"
    echo "- Monitor battery usage during extended AI sessions"
    echo ""
    echo "🎯 Your app now has:"
    echo "- Local sentiment analysis for bubble coloring"
    echo "- Message summaries and explanations"
    echo "- CBT therapist mode (Serine assistant)"
    echo "- All AI features work offline!"
else
    echo "❌ Download failed. Please check your internet connection and try again."
    echo "Alternative: Manually download from https://huggingface.co/microsoft/phi-2-gguf"
    exit 1
fi
