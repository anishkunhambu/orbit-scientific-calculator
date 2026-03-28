# Orbit Scientific Mobile App Guide

This project is set up to be packaged as Android and iOS apps using Capacitor.

## What You Need First

### On Windows for Android

1. Install Node.js LTS
2. Install Java JDK 17 or later
3. Install Android Studio
4. Install Android SDK through Android Studio

### For iOS

You will eventually need:

1. A Mac
2. Xcode
3. An Apple Developer account for App Store/TestFlight deployment

You can prepare the project on Windows, but iOS building/signing must happen on macOS.

## Step 1: Verify Tools

Open terminal in the project folder and run:

```bash
node -v
npm -v
java -version
```

If any of these fail, install the missing tool first.

## Step 2: Install Capacitor Dependencies

From the project folder:

```bash
npm install
```

This will use:

- `package.json`
- `capacitor.config.json`

already included in this project.

## Step 3: Initialize Native Projects

### Android

```bash
npx cap add android
```

### iOS

```bash
npx cap add ios
```

If you are still on Windows, you can skip iOS for now and do it later on a Mac.

## Step 4: Sync the Web App into the Native Shell

Whenever your web files change, run:

```bash
npx cap sync
```

This copies the current web app into the native projects.

## Step 5: Open Native Projects

### Android Studio

```bash
npx cap open android
```

### Xcode

```bash
npx cap open ios
```

## Android Build and Deployment

### Debug Testing on Phone

1. Open Android Studio
2. Connect your phone or start an emulator
3. Click `Run`

### Generate APK / AAB

In Android Studio:

1. `Build`
2. `Generate Signed Bundle / APK`
3. Choose:
   - `Android App Bundle (AAB)` for Play Store
   - `APK` for direct install/testing

### Google Play Store

1. Create a Google Play Console account
2. Create a new app
3. Upload the signed `.aab`
4. Fill in:
   - app description
   - icon
   - screenshots
   - privacy details
5. Submit for review

## iOS Build and Deployment

### Test on iPhone

1. Open the project in Xcode on a Mac
2. Connect your iPhone
3. Select your Apple team/signing settings
4. Run the app

### TestFlight / App Store

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Use TestFlight for beta testing
4. Submit to App Review

## How Updates Work

For any calculator change:

1. edit the web files
2. run:

```bash
npx cap sync
```

3. rebuild the Android/iOS project if needed

## Recommended Workflow

1. Test web app locally
2. Run:
   - `calculator-tests.html`
   - `voice-parser-tests.html`
   - `feature-checklist.html`
3. Run `npx cap sync`
4. Test on Android device
5. Later package for iOS on a Mac

## Notes

- Capacitor wraps your current web app, so you do not need a full native rewrite
- Voice recognition behavior still depends on the underlying mobile browser/webview support
- If you want stronger native voice features later, Capacitor can be extended with native plugins
