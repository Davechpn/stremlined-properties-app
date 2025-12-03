#!/bin/bash
# Setup Reactotron for Android Emulator
# This script sets up ADB port forwarding so the Android emulator can connect to Reactotron

echo "🔧 Setting up Reactotron for Android..."

# Check if adb is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android SDK Platform Tools."
    exit 1
fi

# Check if any devices are connected
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
    echo "❌ No Android devices or emulators detected."
    echo "   Please start your Android emulator and try again."
    exit 1
fi

# Set up port forwarding for Reactotron (default port 9090)
echo "📡 Setting up port forwarding for Reactotron (port 9090)..."
adb reverse tcp:9090 tcp:9090

if [ $? -eq 0 ]; then
    echo "✅ Reactotron port forwarding configured successfully!"
    echo ""
    echo "Now you can:"
    echo "  1. Open Reactotron desktop app"
    echo "  2. Reload your React Native app (press 'r' in Expo or shake device)"
    echo "  3. You should see 'Streamlined Properties' connected in Reactotron"
else
    echo "❌ Failed to set up port forwarding."
    exit 1
fi
