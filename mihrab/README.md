# مِحراب — Mihrab

Prayer app: prayer times and adhan, the full Quran with recitation, and a qibla compass. Standalone; not part of the tafawoq.site build.

- `web/` — the app itself (HTML/CSS/JS, works offline).
- `android/` — Android shell: WebView that serves `web/` from the APK, plus exact alarms and notifications so the adhan arrives when the app is closed.

## Build the APK

Needs JDK 17+ and an Android SDK with `platforms;android-35` and `build-tools;35.0.0`.

```bash
cd mihrab/android
ANDROID_SDK=/path/to/sdk KEYSTORE=/path/mihrab-release.jks KS_PASS=... VERSION_CODE=2 VERSION_NAME=1.1 ./build.sh
# -> android/build/mihrab.apk
```

Keep the same keystore for every release, otherwise phones refuse to install the update over the old version.
