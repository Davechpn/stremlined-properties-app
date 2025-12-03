# T064: Manual Platform Testing with Network Interruptions

## Testing Date
November 30, 2025

## Objective
Test the complete authentication flow on iOS and Android with network interruptions (airplane mode toggle) to verify error handling and retry logic.

## Prerequisites
✅ Expo development server running (`npx expo start --clear`)
✅ iOS Simulator installed (Xcode)
✅ Android Emulator installed (Android Studio) or physical device
✅ Reactotron running for debug logging
✅ Sentry configured for error tracking

---

## Test Environment Setup

### 1. iOS Simulator

**Start Expo & Open iOS Simulator:**
```bash
npx expo start
# In the Expo terminal, press 'i' to launch iOS simulator
```

**Enable Airplane Mode (Network Loss):**
```bash
# Method 1: Using Network Link Conditioner (if installed)
# In Simulator: Hardware menu → Network Link Conditioner → 100% Loss

# Method 2: Use Settings app in simulator
# Open Settings → Airplane Mode → Toggle ON
```

**Test Deep Links:**
```bash
# Password reset deep link
xcrun simctl openurl booted "streamlinedproperties://reset-password?token=test123"

# Invitation deep link
xcrun simctl openurl booted "streamlinedproperties://invitation?token=invite789"
```

**Clear App Data:**
```bash
# Uninstall Expo Go app to clear data
xcrun simctl uninstall booted host.exp.Exponent
```

---

### 2. Android Emulator

**Start Expo & Open Android Emulator:**
```bash
npx expo start
# In the Expo terminal, press 'a' to launch Android emulator
```

**Enable Airplane Mode:**
```bash
# Turn ON airplane mode
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# Turn OFF airplane mode
adb shell settings put global airplane_mode_on 0
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE
```

**Test Deep Links:**
```bash
# Password reset deep link
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://reset-password?token=test123"

# Invitation deep link
adb shell am start -a android.intent.action.VIEW -d "streamlinedproperties://invitation?token=invite789"
```

**Clear App Data:**
```bash
# Clear Expo Go app data
adb shell pm clear host.exp.exponent
```

---

## Test Cases

### Test Case 1: Sign-Up Flow with Network Interruption

**Scenario**: User attempts to sign up while network is interrupted

**Steps**:
1. Open app on iOS Simulator
2. Navigate through welcome/onboarding screens → Tap "Get Started"
3. On Sign-Up screen, fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
4. **BEFORE submitting**: Enable Airplane Mode
5. Tap "Sign Up" button
6. **Expected Results**:
   - ✅ Button shows loading indicator
   - ✅ Button becomes disabled
   - ✅ After timeout (5-10 seconds), error message appears
   - ✅ Error message is user-friendly: "Network connection error. Please check your internet and try again."
   - ✅ Haptic error feedback occurs (vibration)
   - ✅ Reactotron logs error with context
   - ✅ Sentry captures network error with user context
   - ✅ Button re-enables for retry
7. Disable Airplane Mode
8. Tap "Sign Up" again
9. **Expected Results**:
   - ✅ Request succeeds
   - ✅ Token stored in SecureStore
   - ✅ Success haptic feedback
   - ✅ Navigates to dashboard
   - ✅ Dashboard loads within 2 seconds

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 2: Sign-In Flow with Network Interruption

**Scenario**: User attempts to sign in while network is interrupted

**Steps**:
1. On Sign-In screen, fill in:
   - Email: "test@example.com"
   - Password: "SecurePass123!"
2. Check "Remember Me" toggle
3. **BEFORE submitting**: Enable Airplane Mode
4. Tap "Sign In" button
5. **Expected Results**:
   - ✅ Loading indicator appears
   - ✅ Button disabled
   - ✅ Network error message displayed
   - ✅ Haptic error feedback
   - ✅ Error logged to Reactotron
   - ✅ Error captured in Sentry
6. Disable Airplane Mode
7. Tap "Sign In" again
8. **Expected Results**:
   - ✅ Sign-in succeeds
   - ✅ Token stored with 7-day expiration (Remember Me was checked)
   - ✅ Success haptic feedback
   - ✅ Navigates to dashboard

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 3: Forgot Password Flow with Network Interruption

**Scenario**: User requests password reset while network is interrupted

**Steps**:
1. On Sign-In screen, tap "Forgot Password?"
2. On Forgot Password screen, enter email: "test@example.com"
3. **BEFORE submitting**: Enable Airplane Mode
4. Tap "Send Reset Link" button
5. **Expected Results**:
   - ✅ Loading indicator appears
   - ✅ Network error displayed
   - ✅ Haptic error feedback
   - ✅ Retry button available
6. Disable Airplane Mode
7. Tap "Send Reset Link" again
8. **Expected Results**:
   - ✅ Success message: "Reset link sent to your email"
   - ✅ Success haptic feedback
   - ✅ Reactotron logs request/response

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 4: OTP Verification with Network Interruption

**Scenario**: User enters OTP code while network is interrupted

**Steps**:
1. Navigate to Phone/OTP sign-in option
2. Enter phone number: "+1234567890"
3. Tap "Send Code" (should succeed)
4. On OTP verification screen, enter 6-digit code: "123456"
5. **BEFORE submitting**: Enable Airplane Mode
6. Tap "Verify" button
7. **Expected Results**:
   - ✅ Loading indicator appears
   - ✅ Network error displayed
   - ✅ Haptic error feedback
   - ✅ "Resend Code" button still available
   - ✅ Countdown timer continues
8. Disable Airplane Mode
9. Tap "Verify" again
10. **Expected Results**:
    - ✅ Verification succeeds or shows "Invalid OTP" (depends on backend)
    - ✅ Appropriate feedback provided

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 5: Google OAuth with Network Interruption

**Scenario**: User attempts OAuth while network is interrupted

**Steps**:
1. On Sign-In screen, tap "Continue with Google" button
2. **BEFORE OAuth popup opens**: Enable Airplane Mode
3. Observe behavior
4. **Expected Results**:
   - ✅ Network error displayed
   - ✅ Haptic error feedback
   - ✅ OAuth flow gracefully fails
   - ✅ User can retry
5. Disable Airplane Mode
6. Tap "Continue with Google" again
7. **Expected Results**:
   - ✅ OAuth popup opens
   - ✅ Flow continues normally (or shows Google's own network error)

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 6: Password Reset Deep Link with Network Interruption

**Scenario**: User clicks password reset deep link while offline

**Steps**:
1. Generate test deep link: `streamlinedproperties://reset-password?token=test123`
2. Enable Airplane Mode
3. Open deep link (use `xcrun simctl openurl booted "streamlinedproperties://reset-password?token=test123"`)
4. **Expected Results**:
   - ✅ App opens and navigates to reset-password screen
   - ✅ Token parameter available in route
   - ✅ Screen displays offline indicator (if implemented)
   - ✅ Deep link event logged to Reactotron
   - ✅ Deep link breadcrumb added to Sentry
5. On reset password screen, fill in:
   - New Password: "NewSecure123!"
   - Confirm Password: "NewSecure123!"
6. Tap "Reset Password" (still offline)
7. **Expected Results**:
   - ✅ Network error displayed
   - ✅ Haptic error feedback
8. Disable Airplane Mode
9. Tap "Reset Password" again
10. **Expected Results**:
    - ✅ Password reset succeeds
    - ✅ Auto sign-in occurs
    - ✅ Navigates to dashboard

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 7: Token Refresh with Network Interruption

**Scenario**: App attempts to refresh expired token while offline

**Steps**:
1. Sign in successfully
2. Wait for token to near expiration OR manually expire token in SecureStore
3. Enable Airplane Mode
4. Trigger API call (navigate to profile, pull to refresh dashboard)
5. **Expected Results**:
   - ✅ Axios interceptor attempts token refresh
   - ✅ Refresh fails due to network
   - ✅ Error message displayed
   - ✅ User not logged out immediately
   - ✅ Retry option available
6. Disable Airplane Mode
7. Trigger API call again
8. **Expected Results**:
   - ✅ Token refresh succeeds
   - ✅ Original API call proceeds
   - ✅ User remains authenticated

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

### Test Case 8: Intermittent Network (Multiple Toggles)

**Scenario**: Network drops multiple times during authentication flow

**Steps**:
1. Start sign-up flow
2. Toggle Airplane Mode ON → wait 3 seconds → toggle OFF
3. Continue filling form
4. Toggle Airplane Mode ON → wait 3 seconds → toggle OFF
5. Submit sign-up
6. **Expected Results**:
   - ✅ App handles multiple network state changes gracefully
   - ✅ No crashes or frozen UI
   - ✅ All error messages are appropriate
   - ✅ Retry logic works consistently

**Status**: [ ] PASS / [ ] FAIL  
**Notes**: ___________________________________

---

## Android Testing

**Repeat all 8 test cases on Android Emulator**

### Android-Specific Checks:
- ✅ Network error messages display correctly
- ✅ Haptic feedback works (Haptics.notificationAsync)
- ✅ Loading indicators animate smoothly
- ✅ Keyboard handling during errors
- ✅ Back button behavior during network errors

**Android Test Results Summary**:
- Test Case 1: [ ] PASS / [ ] FAIL
- Test Case 2: [ ] PASS / [ ] FAIL
- Test Case 3: [ ] PASS / [ ] FAIL
- Test Case 4: [ ] PASS / [ ] FAIL
- Test Case 5: [ ] PASS / [ ] FAIL
- Test Case 6: [ ] PASS / [ ] FAIL
- Test Case 7: [ ] PASS / [ ] FAIL
- Test Case 8: [ ] PASS / [ ] FAIL

---

## Monitoring Verification

### Sentry Dashboard Checks:
1. Open Sentry dashboard
2. Filter for authentication errors
3. **Verify**:
   - ✅ Network errors captured with full context
   - ✅ User context included (user ID, email)
   - ✅ Breadcrumbs show navigation flow
   - ✅ Deep link events logged
   - ✅ Error grouping is logical

### Reactotron Checks:
1. Open Reactotron desktop app
2. **Verify**:
   - ✅ All API calls logged (request/response)
   - ✅ Network errors logged with timing
   - ✅ Auth flow events visible
   - ✅ Deep link parsing logged
   - ✅ Token storage operations logged

---

## Performance Metrics

During testing, measure and record:

| Metric | Target | iOS Result | Android Result |
|--------|--------|------------|----------------|
| Network error timeout | 5-10s | ___ s | ___ s |
| Error message display time | <500ms | ___ ms | ___ ms |
| Retry attempt time | <2s | ___ s | ___ s |
| Token storage time | <100ms | ___ ms | ___ ms |
| Deep link navigation | <1s | ___ s | ___ s |

---

## Known Issues / Bugs Found

| Issue # | Platform | Description | Severity | Status |
|---------|----------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Final Checklist

### iOS Testing:
- [ ] All 8 test cases executed
- [ ] All test cases passed
- [ ] Sentry monitoring verified
- [ ] Reactotron logging verified
- [ ] Performance metrics recorded
- [ ] No critical bugs found

### Android Testing:
- [ ] All 8 test cases executed
- [ ] All test cases passed
- [ ] Sentry monitoring verified
- [ ] Reactotron logging verified
- [ ] Performance metrics recorded
- [ ] No critical bugs found

### Overall Assessment:
- [ ] Authentication flow is production-ready
- [ ] Network error handling is robust
- [ ] User feedback is clear and helpful
- [ ] Retry logic works consistently
- [ ] Monitoring captures all critical events

---

## Sign-Off

**Tester**: ___________________________________  
**Date**: ___________________________________  
**Overall Result**: [ ] PASS / [ ] FAIL  

**Recommendations**:
___________________________________
___________________________________
___________________________________

**Phase 4 Status**: [ ] 100% Complete - Ready for Phase 5
