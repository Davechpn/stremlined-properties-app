# Quickstart Guide: Account Management Development

**Feature**: Account Management Module  
**Date**: 2025-11-29  
**Target Audience**: Developers setting up local environment for feature development

## Overview

This guide walks through setting up a complete development environment for building the Account Management module. You'll configure Expo, install dependencies, set up Sentry for error tracking, configure Reactotron for debugging, and run the app on iOS Simulator and Android Emulator.

**Prerequisites**:
- macOS 12+ (for iOS development) or Windows/Linux (Android only)
- Node.js 18+ installed
- Git installed and repository cloned
- Xcode 14+ (for iOS, macOS only) with Command Line Tools
- Android Studio (for Android) with SDK 33+ and emulator configured
- Code editor (VS Code recommended)

---

## 1. Environment Setup

### Install Node.js and Expo CLI

```bash
# Verify Node.js version (18+ required)
node --version

# Install Expo CLI globally
npm install -g expo-cli

# Verify Expo CLI installation
expo --version
```

### Install Dependencies

```bash
# Navigate to project root
cd streamlined-properties-app

# Install npm dependencies
npm install

# Verify installation
npm list --depth=0
```

**Key Dependencies Installed**:
- `expo` ~54.0.0
- `expo-router` ~6.0.0
- `react-native` 0.81.5
- `@tanstack/react-query` ^5.0.0
- `react-native-paper` ^5.0.0
- `@sentry/react-native` ^5.0.0
- `reactotron-react-native` ^5.0.0
- `react-native-reanimated` ~4.1.0
- `expo-image` ~3.0.0

---

## 2. Environment Variables Configuration

### Create Environment Files

```bash
# Create development environment file
cp .env.example .env.development

# Create production environment file (for future use)
cp .env.example .env.production
```

### Edit `.env.development`

```bash
# API Configuration
API_BASE_URL=http://localhost:3000/v1
API_TIMEOUT=30000

# Authentication
GOOGLE_EXPO_CLIENT_ID=your-expo-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Sentry (Development DSN)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0

# App Configuration
APP_NAME=Streamlined Properties
APP_SCHEME=streamlinedproperties
```

**Important**: Never commit `.env.development` or `.env.production` to version control. Add to `.gitignore`:

```bash
echo ".env.development" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## 3. iOS Development Setup (macOS Only)

### Install Xcode

1. Download Xcode from Mac App Store (Xcode 14+)
2. Open Xcode and accept license agreement
3. Install Command Line Tools:

```bash
xcode-select --install
```

### Install CocoaPods

```bash
# Install CocoaPods (required for iOS native modules)
sudo gem install cocoapods

# Navigate to iOS directory and install pods
cd ios
pod install
cd ..
```

### Launch iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Start Expo development server for iOS
npm run ios

# Or specify simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

**Troubleshooting iOS**:
- **Error: "Unable to find simulator"**: Open Xcode → Preferences → Locations → Command Line Tools → Select Xcode version
- **Pod install fails**: Run `sudo gem update cocoapods` and retry
- **Metro bundler port conflict**: Kill process on port 8081: `lsof -ti:8081 | xargs kill -9`

---

## 4. Android Development Setup

### Install Android Studio

1. Download Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Install Android SDK 33+ via SDK Manager
3. Configure environment variables:

```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.zshrc  # or source ~/.bash_profile
```

### Create Android Virtual Device (AVD)

1. Open Android Studio
2. Tools → AVD Manager → Create Virtual Device
3. Select device: Pixel 6 (recommended)
4. Select system image: Android 13 (API 33, x86_64)
5. Finish and launch emulator

### Launch Android Emulator

```bash
# List available AVDs
emulator -list-avds

# Start emulator (replace with your AVD name)
emulator -avd Pixel_6_API_33 &

# Start Expo development server for Android
npm run android
```

**Troubleshooting Android**:
- **Error: "SDK location not found"**: Create `android/local.properties` with `sdk.dir=/path/to/android/sdk`
- **Emulator crashes**: Increase RAM in AVD settings (4GB+ recommended)
- **Gradle build fails**: Run `cd android && ./gradlew clean && cd ..`

---

## 5. Sentry Setup

### Create Sentry Project

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project: React Native
3. Copy DSN from project settings
4. Add DSN to `.env.development`

### Configure Sentry

**Already configured in codebase**:

```typescript
// services/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    enableAutoSessionTracking: true,
  });
};
```

**Verify Sentry Integration**:

```bash
# Run app and trigger test error
npm run ios  # or npm run android

# In app, navigate to settings and tap "Test Sentry"
# Check Sentry dashboard for error event
```

---

## 6. Reactotron Setup

### Install Reactotron Desktop App

1. Download from [github.com/infinitered/reactotron/releases](https://github.com/infinitered/reactotron/releases)
2. Install and open Reactotron app
3. Reactotron listens on port 9090 by default

### Configure Reactotron

**Already configured in codebase**:

```typescript
// services/monitoring/reactotron.ts
import Reactotron from 'reactotron-react-native';

export const initReactotron = () => {
  if (__DEV__) {
    Reactotron
      .configure({ name: 'Streamlined Properties' })
      .useReactNative({
        networking: { ignoreUrls: /symbolicate/ },
      })
      .connect();
  }
};
```

**Verify Reactotron Connection**:

```bash
# Start app in development mode
npm run ios  # or npm run android

# Open Reactotron desktop app
# You should see "Streamlined Properties" connected
# Check Timeline for app lifecycle events
```

**Reactotron Features**:
- **Timeline**: View all logs, API calls, navigation events
- **State**: Inspect AsyncStorage contents
- **API**: Monitor request/response details and timing
- **Custom Logs**: Use `Reactotron.log('message', data)` in code

---

## 7. Running the Development Server

### Start Expo Development Server

```bash
# Start with Expo Go (development mode)
npm start

# Or directly start iOS/Android
npm run ios      # iOS Simulator
npm run android  # Android Emulator

# Clear cache if needed
npm start -- --clear
```

**Expo DevTools**:
- Metro bundler runs on http://localhost:8081
- Expo DevTools at http://localhost:19002
- Press `i` for iOS, `a` for Android, `w` for web

### Development Workflow

1. **Hot Reload**: Edit files and save → changes reflect instantly
2. **Fast Refresh**: Maintains component state during edits
3. **Reload App**: Shake device or press `r` in terminal
4. **Debug Menu**: Shake device or `Cmd+D` (iOS) / `Cmd+M` (Android)

---

## 8. Running on Physical Devices

### iOS Physical Device (macOS + Apple Developer Account)

1. Connect iPhone via USB
2. Open Xcode → Signing & Capabilities → Select Team
3. Trust certificate on iPhone (Settings → General → Device Management)
4. Run: `npm run ios -- --device`

### Android Physical Device

1. Enable Developer Options on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging (Developer Options → USB Debugging)
3. Connect via USB and accept prompt
4. Run: `npm run android -- --device`

**Verify Device Connection**:
```bash
# iOS
xcrun simctl list devices | grep Booted

# Android
adb devices
```

---

## 9. Backend API Setup (Local Development)

### Option A: Use Staging API (Recommended for Frontend Dev)

```bash
# Update .env.development
API_BASE_URL=https://api-staging.streamlinedproperties.com/v1
```

### Option B: Run Backend Locally

```bash
# Clone backend repository (separate repo)
git clone https://github.com/streamlined-properties/backend-api.git
cd backend-api

# Install dependencies and run
npm install
npm run dev  # Runs on http://localhost:3000

# Seed database with test data
npm run db:seed
```

**Test Backend Connection**:

```bash
# From mobile app, test API health check
curl http://localhost:3000/v1/health

# Response: { "status": "ok", "version": "1.0.0" }
```

---

## 10. Testing Account Management Features

### Test Credentials (Staging API)

```json
{
  "email": "test@example.com",
  "password": "TestPass123!",
  "phoneNumber": "+12125555555"
}
```

### Manual Testing Workflow

1. **Welcome Flow**:
   - Launch app → View onboarding screens → Tap "Get Started"

2. **Sign Up**:
   - Choose authentication method (Google, Email, Phone)
   - Complete registration → Verify success

3. **Sign In**:
   - Sign out → Sign in with credentials → Verify session persists

4. **Dashboard**:
   - View dashboard with no organizations (empty state)
   - Create organization → Verify dashboard updates

5. **Organization Switching**:
   - Create 2nd organization → Tap org switcher → Switch context

6. **Team Management**:
   - Invite member via email → Check invitation sent
   - Accept invitation (use 2nd test account) → Verify member added

7. **Profile Management**:
   - Update name, email → Verify changes persist
   - Upload profile photo → Verify photo displays

### Automated Testing (Future)

```bash
# Run unit tests (Jest)
npm test

# Run E2E tests (Detox - to be configured)
npm run e2e:ios
npm run e2e:android
```

---

## 11. Debugging Tips

### Common Issues & Solutions

**Issue: "Metro bundler not running"**
```bash
# Kill existing Metro process
lsof -ti:8081 | xargs kill -9

# Restart with cache cleared
npm start -- --clear
```

**Issue: "Module not found" after installing dependency**
```bash
# Reset Metro bundler and reinstall
rm -rf node_modules
npm install
npm start -- --reset-cache
```

**Issue: iOS build fails with CocoaPods error**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**Issue: Android build fails with Gradle error**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Issue: App crashes on launch**
1. Check Sentry dashboard for error details
2. Check Reactotron logs for stack trace
3. Verify environment variables are set correctly
4. Check Metro bundler terminal for JavaScript errors

### Debugging Tools

**React Native Debugger**:
```bash
# Install React Native Debugger (alternative to Chrome DevTools)
brew install --cask react-native-debugger

# Open debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

**Chrome DevTools**:
1. Shake device → Enable Remote JS Debugging
2. Chrome opens at http://localhost:8081/debugger-ui
3. Use Console, Network, Sources tabs

**Flipper** (Facebook's debugging platform):
```bash
# Install Flipper
brew install --cask flipper

# Launch Flipper and connect to running app
```

---

## 12. VSCode Setup (Optional but Recommended)

### Install Extensions

```bash
# Install from VSCode marketplace or use CLI
code --install-extension msjsdiag.vscode-react-native
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next
```

**Recommended Extensions**:
- **React Native Tools**: Debugging and IntelliSense
- **Prettier**: Code formatting
- **ESLint**: Linting
- **TypeScript**: Type checking
- **GitLens**: Git integration
- **Expo Tools**: Expo commands in command palette

### VSCode Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "search.exclude": {
    "**/node_modules": true,
    "**/ios/build": true,
    "**/android/build": true,
    "**/android/.gradle": true
  }
}
```

---

## 13. Development Best Practices

### Branch Strategy

```bash
# Always work on feature branches
git checkout -b 001-account-management

# Never commit directly to main
git push origin 001-account-management
```

### Code Quality Checks

```bash
# Run TypeScript compiler
npm run type-check

# Run ESLint
npm run lint

# Run Prettier
npm run format

# Run all checks before committing
npm run pre-commit
```

### Commit Message Format

```
feat(auth): implement Google OAuth sign-in

- Add Expo AuthSession configuration
- Create Google OAuth button component
- Integrate with backend /auth/google endpoint
- Add Sentry logging for auth events

Refs: #123
```

---

## 14. Next Steps

After completing this quickstart guide:

1. **Review Architecture**: Read `research.md` for technology decisions
2. **Understand Data Model**: Read `data-model.md` for entity definitions
3. **Study API Contracts**: Review `contracts/*.yaml` for endpoint specifications
4. **Check Tasks**: Run `/speckit.tasks` to generate implementation task breakdown
5. **Start Coding**: Follow task order in `tasks.md` (once generated)

---

## 15. Useful Commands Cheat Sheet

```bash
# Development
npm start                 # Start Expo dev server
npm run ios              # Run on iOS Simulator
npm run android          # Run on Android Emulator
npm run web              # Run in web browser (limited support)

# Debugging
npm start -- --clear     # Clear Metro cache
npm run type-check       # TypeScript compilation check
npm run lint             # ESLint check
npm run format           # Prettier format

# Building
npm run build:ios        # Build iOS bundle
npm run build:android    # Build Android bundle

# Testing (to be configured)
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run e2e:ios          # Run E2E tests on iOS
npm run e2e:android      # Run E2E tests on Android

# Cleanup
rm -rf node_modules && npm install  # Reinstall dependencies
npm start -- --reset-cache          # Reset Metro cache
cd ios && pod install && cd ..      # Reinstall iOS pods
cd android && ./gradlew clean       # Clean Android build
```

---

## 16. Support & Resources

**Documentation**:
- Expo Docs: https://docs.expo.dev
- React Native Paper: https://callstack.github.io/react-native-paper
- TanStack Query: https://tanstack.com/query/latest/docs/react/overview
- Sentry React Native: https://docs.sentry.io/platforms/react-native
- Reactotron: https://github.com/infinitered/reactotron

**Team Communication**:
- Slack: #mobile-dev channel
- GitHub: [Repository Issues](https://github.com/streamlined-properties/mobile-app/issues)
- Notion: Project Documentation

**Getting Help**:
1. Check this quickstart guide and other spec docs
2. Search GitHub issues for similar problems
3. Ask in #mobile-dev Slack channel
4. Create detailed GitHub issue with reproduction steps

---

**Quickstart Complete!** 🎉

You're now ready to start developing the Account Management module. Happy coding!
