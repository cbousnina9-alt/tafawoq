#!/usr/bin/env bash
# Builds mihrab.apk without Gradle: aapt2 -> javac -> d8 -> zipalign -> apksigner.
# Usage: ANDROID_SDK=/path/to/sdk KEYSTORE=/path/key.jks KS_PASS=... ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_SDK:?set ANDROID_SDK}"
BT="$SDK/build-tools/35.0.0"
JAR="$SDK/platforms/android-35/android.jar"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0}"
OUT=build
rm -rf "$OUT" && mkdir -p "$OUT/assets/www" "$OUT/gen" "$OUT/classes" "$OUT/dex"

# Web app (the service worker and PWA manifest are not used inside the app)
cp -r ../web/. "$OUT/assets/www/"
rm -f "$OUT/assets/www/sw.js"

"$BT/aapt2" compile --dir res -o "$OUT/res.zip"
"$BT/aapt2" link -o "$OUT/base.apk" -I "$JAR" --manifest AndroidManifest.xml \
  -A "$OUT/assets" --java "$OUT/gen" "$OUT/res.zip" \
  --min-sdk-version 26 --target-sdk-version 34 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" --auto-add-overlay

javac -nowarn -source 11 -target 11 -classpath "$JAR" -d "$OUT/classes" \
  $(find src "$OUT/gen" -name '*.java') 2>&1 | grep -v 'bootstrap classpath' || true
"$BT/d8" --release --min-api 26 --lib "$JAR" --output "$OUT/dex" $(find "$OUT/classes" -name '*.class')

cp "$OUT/base.apk" "$OUT/unaligned.apk"
(cd "$OUT/dex" && zip -q -j ../unaligned.apk classes.dex)
"$BT/zipalign" -P 16 -f 4 "$OUT/unaligned.apk" "$OUT/aligned.apk"
"$BT/apksigner" sign --ks "${KEYSTORE:?set KEYSTORE}" --ks-pass "pass:${KS_PASS:?set KS_PASS}" \
  --out "$OUT/mihrab.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify "$OUT/mihrab.apk"
echo "Built $OUT/mihrab.apk"
