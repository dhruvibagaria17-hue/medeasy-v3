# Generating the Medeasy Android APK

To generate the APK for your project, you will need to perform the final build steps on your local machine, as it requires the **Android SDK** and **Android Studio**.

I have already prepared the project configuration and installed the necessary **Ionic Capacitor** dependencies.

## Prerequisites
1.  **Node.js** installed on your computer.
2.  **Android Studio** installed and configured with the Android SDK.
3.  **Java (JDK 17+)** installed.

## Steps to Generate the APK

### 1. Download the Project
Download your entire `Medeasy` project folder to your computer.

### 2. Install Local Dependencies
Open a terminal in your project folder and run:
```bash
npm install
```

### 3. Build and Sync
Run the mobile build command I created for you:
```bash
npm run mobile:build
```
*This will create the production web build and sync it with the Android project.*

### 4. Add the Android Platform
If the `android` folder does not exist yet, run:
```bash
npx cap add android
```

### 5. Open in Android Studio
Open the project in Android Studio by running:
```bash
npm run mobile:open
```
*Alternatively, open Android Studio and select the `android` folder within your project.*

### 6. Build the APK in Android Studio
1.  Wait for Gradle to finish syncing.
2.  In the top menu, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  Once finished, a notification will appear. Click **locate** to find your `app-debug.apk` file.

---
**Note:** If you want to release the app on the Play Store, you should select **Build > Generate Signed Bundle / APK** instead.
