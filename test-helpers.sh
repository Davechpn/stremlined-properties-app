#!/bin/bash

# T064 Testing Helper Scripts
# Use these commands during manual testing

echo "=== T064 Testing Helper Scripts ==="
echo ""

# Function to test deep link on iOS Simulator
test_ios_deeplink() {
    local token=${1:-"test123"}
    echo "Testing iOS deep link with token: $token"
    xcrun simctl openurl booted "streamlinedproperties://reset-password?token=$token"
    echo "✅ Deep link sent to iOS Simulator"
}

# Function to test invitation deep link on iOS Simulator
test_ios_invitation() {
    local token=${1:-"invite789"}
    echo "Testing iOS invitation deep link with token: $token"
    xcrun simctl openurl booted "streamlinedproperties://invitation?token=$token"
    echo "✅ Invitation deep link sent to iOS Simulator"
}

# Function to enable/disable airplane mode on iOS Simulator
toggle_ios_network() {
    echo "To toggle iOS network:"
    echo "1. Hardware → Network Link Conditioner → 100% Loss (to disable)"
    echo "2. Hardware → Network Link Conditioner → WiFi (to enable)"
    echo ""
    echo "Or use this command to simulate poor network:"
    echo "sudo /Applications/Xcode.app/Contents/Developer/usr/bin/NetworkLinkConditioner.prefPane/Contents/Resources/Network\\ Link\\ Conditioner enable"
}

# Function to test deep link on Android Emulator
test_android_deeplink() {
    local token=${1:-"test123"}
    echo "Testing Android deep link with token: $token"
    adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://reset-password?token=$token"
    echo "✅ Deep link sent to Android Emulator"
}

# Function to test invitation deep link on Android Emulator
test_android_invitation() {
    local token=${1:-"invite789"}
    echo "Testing Android invitation deep link with token: $token"
    adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://invitation?token=$token"
    echo "✅ Invitation deep link sent to Android Emulator"
}

# Function to toggle airplane mode on Android Emulator
toggle_android_network() {
    echo "To toggle Android network:"
    echo "1. adb shell settings put global airplane_mode_on 1"
    echo "2. adb shell am broadcast -a android.intent.action.AIRPLANE_MODE"
    echo ""
    echo "To disable:"
    echo "1. adb shell settings put global airplane_mode_on 0"
    echo "2. adb shell am broadcast -a android.intent.action.AIRPLANE_MODE"
}

# Function to clear app data on iOS
clear_ios_data() {
    echo "Clearing iOS app data..."
    xcrun simctl uninstall booted host.exp.Exponent 2>/dev/null || echo "App not installed"
    echo "✅ iOS app data cleared"
}

# Function to clear app data on Android
clear_android_data() {
    echo "Clearing Android app data..."
    adb shell pm clear host.exp.exponent 2>/dev/null || echo "App not installed"
    echo "✅ Android app data cleared"
}

# Main menu
echo "Available commands:"
echo ""
echo "iOS Testing:"
echo "  source test-helpers.sh && test_ios_deeplink [token]"
echo "  source test-helpers.sh && test_ios_invitation [token]"
echo "  source test-helpers.sh && clear_ios_data"
echo ""
echo "Android Testing:"
echo "  source test-helpers.sh && test_android_deeplink [token]"
echo "  source test-helpers.sh && test_android_invitation [token]"
echo "  source test-helpers.sh && clear_android_data"
echo ""
echo "Network Simulation:"
echo "  source test-helpers.sh && toggle_ios_network"
echo "  source test-helpers.sh && toggle_android_network"
echo ""
echo "Quick Start:"
echo "  1. Run: npx expo start"
echo "  2. Press 'i' for iOS or 'a' for Android"
echo "  3. Use commands above to test"
echo ""
