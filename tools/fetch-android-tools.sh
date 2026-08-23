#!/usr/bin/env bash
# APK 빌드에 필요한 도구를 내려받는다. (Android Studio / SDK 설치 불필요)
#   - aapt2      : npm 패키지 aaptjs3 에 들어 있는 리눅스 바이너리
#   - dx         : Maven Central com.google.android.tools:dx
#   - apksig     : Maven Central com.android.tools.build:apksig
#   - android.jar: Maven Central org.robolectric:android-all (프레임워크 클래스 + 리소스)
set -euo pipefail
ANDTOOLS="${ANDTOOLS:-/opt/andtools}"
mkdir -p "$ANDTOOLS/bin"
cd "$ANDTOOLS"

M=https://repo1.maven.org/maven2
[ -f dx-1.7.jar ]       || curl -sSL -O "$M/com/google/android/tools/dx/1.7/dx-1.7.jar"
[ -f apksig-2.3.0.jar ] || curl -sSL -O "$M/com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar"
[ -f android-all.jar ]  || curl -sSL -o android-all.jar \
    "$M/org/robolectric/android-all/15-robolectric-12650502/android-all-15-robolectric-12650502.jar"

if [ ! -x bin/aapt2 ]; then
  tmp="$(mktemp -d)"
  (cd "$tmp" && npm i aaptjs3 --no-audit --no-fund --silent >/dev/null)
  cp "$tmp/node_modules/aaptjs3/bin/x64/linux/aapt2" bin/aapt2
  chmod +x bin/aapt2
  rm -rf "$tmp"
fi

echo "도구 준비 완료: $ANDTOOLS"
ls -1 "$ANDTOOLS" "$ANDTOOLS/bin"
