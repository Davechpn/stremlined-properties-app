# T064 Quick Command Reference

## 🚀 Start Testing

```bash
# Start Expo server
npx expo start

# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Press 'r' to reload app
```

---

## 📱 iOS Simulator Commands

### Deep Link Testing
```bash
# Password reset
xcrun simctl openurl booted "streamlinedproperties://reset-password?token=test123"

# Invitation
xcrun simctl openurl booted "streamlinedproperties://invitation?token=invite789"
```

### Network Simulation
```bash
# Enable airplane mode via Settings app in simulator:
# Settings → Airplane Mode → ON/OFF

# Or install Network Link Conditioner:
# Xcode → Open Developer Tool → More Developer Tools
# Download "Additional Tools" → Install Network Link Conditioner
# Hardware menu → Network Link Conditioner → 100% Loss
```

### App Management
```bash
# Clear app data (uninstall Expo Go)
xcrun simctl uninstall booted host.exp.Exponent

# List running simulators
xcrun simctl list devices | grep Booted

# Take screenshot
xcrun simctl io booted screenshot screenshot.png
```

---

## 🤖 Android Emulator Commands

### Deep Link Testing
```bash
# Password reset
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://reset-password?token=test123"

# Invitation
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://invitation?token=invite789"
```

### Network Simulation
```bash
# Enable airplane mode
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# Disable airplane mode
adb shell settings put global airplane_mode_on 0
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# Check airplane mode status
adb shell settings get global airplane_mode_on
```

### App Management
```bash
# Clear app data
adb shell pm clear host.exp.exponent

# Force stop app
adb shell am force-stop host.exp.exponent

# Restart app
adb shell monkey -p host.exp.exponent 1

# List installed packages
adb shell pm list packages | grep expo
```

### Debugging
```bash
# View logs (filter for your app)
adb logcat | grep -i "expo\|react"

# Clear logs
adb logcat -c

# Take screenshot
adb exec-out screencap -p > screenshot.png
```

---

## 🧪 Testing Workflow

### Test Case 1: Sign-Up with Network Interruption

**iOS:**
```bash
# 1. Start app: npx expo start → press 'i'
# 2. Navigate to Sign-Up screen
# 3. Fill in form
# 4. Enable airplane mode (Settings app)
# 5. Tap "Sign Up"
# 6. Verify error handling
# 7. Disable airplane mode
# 8. Retry sign-up
```

**Android:**
```bash
# 1. Start app: npx expo start → press 'a'
# 2. Navigate to Sign-Up screen
# 3. Fill in form
# 4. Enable airplane mode:
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# 5. Tap "Sign Up"
# 6. Verify error handling
# 7. Disable airplane mode:
adb shell settings put global airplane_mode_on 0
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# 8. Retry sign-up
```

---

### Test Case 6: Password Reset Deep Link with Network Interruption

**iOS:**
```bash
# 1. Enable airplane mode in Settings app
# 2. Send deep link:
xcrun simctl openurl booted "streamlinedproperties://reset-password?token=test123"

# 3. Verify app opens and navigates
# 4. Fill in new password
# 5. Tap "Reset Password" (will fail - offline)
# 6. Disable airplane mode
# 7. Retry
```

**Android:**
```bash
# 1. Enable airplane mode:
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# 2. Send deep link:
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://reset-password?token=test123"

# 3. Verify app opens and navigates
# 4. Fill in new password
# 5. Tap "Reset Password" (will fail - offline)
# 6. Disable airplane mode:
adb shell settings put global airplane_mode_on 0
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# 7. Retry
```

---

## 🔄 Quick Reset Between Tests

**iOS:**
```bash
# Clear app data and restart
xcrun simctl uninstall booted host.exp.Exponent
# Then press 'i' in Expo terminal to reinstall
```

**Android:**
```bash
# Clear app data and restart
adb shell pm clear host.exp.exponent
adb shell monkey -p host.exp.exponent 1
```

---

## 📊 Monitoring Commands

### Check Network Status

**iOS:**
```bash
# No direct command - check Settings app visually
```

**Android:**
```bash
# Check airplane mode
adb shell settings get global airplane_mode_on
# Returns: 0 (OFF) or 1 (ON)

# Check WiFi
adb shell settings get global wifi_on

# Check mobile data
adb shell settings get global mobile_data
```

### Monitor App Logs

**iOS:**
```bash
# View device logs (use Console.app or Xcode)
# Or check Expo terminal output
```

**Android:**
```bash
# Real-time logs
adb logcat | grep -i "expo\|react\|error"

# Save logs to file
adb logcat -d > test-logs.txt
```

---

## ✅ Testing Checklist

Copy and run these in order:

```bash
# === SETUP ===
npx expo start                      # Start server
# Press 'i' for iOS or 'a' for Android

# === TEST 1: iOS SIGN-UP WITH NETWORK INTERRUPTION ===
# 1. Navigate to sign-up, fill form
# 2. Enable airplane mode in Settings
# 3. Submit form → verify error
# 4. Disable airplane mode
# 5. Submit again → verify success

# === TEST 2: ANDROID SIGN-UP WITH NETWORK INTERRUPTION ===
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE
# Submit form → verify error
adb shell settings put global airplane_mode_on 0
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE
# Submit again → verify success

# === TEST 3: iOS DEEP LINK ===
xcrun simctl openurl booted "streamlinedproperties://reset-password?token=test123"
# Verify navigation and token parameter

# === TEST 4: ANDROID DEEP LINK ===
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://reset-password?token=test123"
# Verify navigation and token parameter

# === CLEANUP ===
xcrun simctl uninstall booted host.exp.Exponent          # iOS clear
adb shell pm clear host.exp.exponent                      # Android clear
```

---

## 🆘 Troubleshooting

### iOS Simulator not responding
```bash
# Kill and restart
killall Simulator
npx expo start
# Press 'i' again
```

### Android Emulator not found
```bash
# List available devices
adb devices

# If empty, start emulator from Android Studio
# Or use command: emulator -avd <device_name>
```

### Deep links not working
```bash
# iOS: Make sure simulator is booted
xcrun simctl list devices | grep Booted

# Android: Check if app is installed
adb shell pm list packages | grep expo

# Verify URL scheme in app.json matches: streamlinedproperties://
```

### Airplane mode not working on Android
```bash
# Alternative method: Disable WiFi and mobile data separately
adb shell svc wifi disable
adb shell svc data disable

# Re-enable
adb shell svc wifi enable
adb shell svc data enable
```

---

## 📝 Recording Test Results

After each test, document in **T064-TESTING-GUIDE.md**:
- [ ] Test case number and platform
- [ ] Pass/Fail status
- [ ] Performance metrics (timeout, error display time, retry time)
- [ ] Screenshots of errors (optional)
- [ ] Any bugs or issues found

**Final Step:** Mark T064 as complete in tasks.md when all 8 test cases pass on both platforms.
