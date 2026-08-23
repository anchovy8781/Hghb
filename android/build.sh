#!/usr/bin/env bash
# 부산 2033 - APK 빌드 스크립트
#
# Android Studio / Gradle 없이 aapt2 + dx + apksig 만으로 APK 를 만든다.
# 필요한 도구는 tools/fetch-android-tools.sh 가 받아 둔 $ANDTOOLS 에서 찾는다.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDTOOLS="${ANDTOOLS:-/opt/andtools}"
OUT="$ROOT/build"
WORK="$OUT/work"
APK_UNSIGNED="$OUT/busan2033-unsigned.apk"
APK_ALIGNED="$OUT/busan2033-aligned.apk"
APK="$OUT/busan2033.apk"
KEYSTORE="${KEYSTORE:-$OUT/busan2033.keystore}"
KS_PASS="${KS_PASS:-busan2033}"

AAPT2="$ANDTOOLS/bin/aapt2"
DX="$ANDTOOLS/dx-1.7.jar"
APKSIG="$ANDTOOLS/apksig-2.3.0.jar"
ANDROID_JAR="$ANDTOOLS/android-all.jar"

for f in "$AAPT2" "$DX" "$APKSIG" "$ANDROID_JAR"; do
  [ -e "$f" ] || { echo "[!] 빌드 도구 없음: $f  ->  bash tools/fetch-android-tools.sh 를 먼저 실행하세요."; exit 1; }
done

echo "== 0. 정리"
rm -rf "$WORK" "$APK_UNSIGNED" "$APK_ALIGNED" "$APK"
mkdir -p "$WORK/compiled" "$WORK/classes" "$WORK/dex" "$WORK/assets"

echo "== 1. 리소스 컴파일"
"$AAPT2" compile --dir "$ROOT/android/res" -o "$WORK/compiled/res.zip"

echo "== 2. 링크 (AndroidManifest + resources.arsc)"
"$AAPT2" link \
  -I "$ANDROID_JAR" \
  --manifest "$ROOT/android/AndroidManifest.xml" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 1 --version-name 1.0.0 \
  -0 arsc \
  -o "$WORK/base.apk" \
  "$WORK/compiled/res.zip"

echo "== 3. 자바 컴파일"
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:-}"
javac -nowarn --release 8 -classpath "$ANDROID_JAR" \
  -encoding UTF-8 -d "$WORK/classes" \
  $(find "$ROOT/android/java" -name '*.java')

echo "== 4. class -> dex"
# dx 1.7 은 class 파일 버전 50(Java 6)까지만 읽는다. 그 위 버전을 50 으로 낮춘다.
python3 - "$WORK/classes" <<'PY'
import sys, pathlib
for p in pathlib.Path(sys.argv[1]).rglob('*.class'):
    b = bytearray(p.read_bytes())
    if b[6] == 0 and b[7] > 50:
        b[7] = 50
        p.write_bytes(bytes(b))
PY
java -cp "$DX" com.android.dx.command.Main --dex --output="$WORK/dex/classes.dex" "$WORK/classes" 2>&1 | grep -v "Picked up JAVA_TOOL_OPTIONS" || true
[ -s "$WORK/dex/classes.dex" ] || { echo "[!] dex 생성 실패"; exit 1; }

echo "== 5. 에셋 수집 (게임 본체)"
mkdir -p "$WORK/assets/web"
cp -R "$ROOT/web/." "$WORK/assets/web/"

echo "== 6. APK 조립"
python3 "$ROOT/tools/assemble_apk.py" \
  --base "$WORK/base.apk" \
  --dex "$WORK/dex/classes.dex" \
  --assets "$WORK/assets" \
  --out "$APK_UNSIGNED"

echo "== 7. zipalign(4바이트 정렬)"
python3 "$ROOT/tools/zipalign.py" "$APK_UNSIGNED" "$APK_ALIGNED"

echo "== 8. 서명"
if [ ! -f "$KEYSTORE" ]; then
  echo "   서명 키 생성: $KEYSTORE"
  keytool -genkeypair -v -keystore "$KEYSTORE" -storetype PKCS12 \
    -storepass "$KS_PASS" -keypass "$KS_PASS" -alias busan2033 \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=Busan2033, OU=Game, O=Busan2033, L=Busan, C=KR" >/dev/null 2>&1
fi
javac -nowarn -cp "$APKSIG" -d "$WORK/signer" -encoding UTF-8 "$ROOT/tools/ApkSignTool.java" "$ROOT/tools/ApkVerifyTool.java"
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED -cp "$APKSIG:$WORK/signer" ApkSignTool "$APK_ALIGNED" "$APK" "$KEYSTORE" "$KS_PASS" busan2033

echo "== 9. 검증"
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 --add-exports java.base/sun.security.x509=ALL-UNNAMED \
  -cp "$APKSIG:$WORK/signer" ApkVerifyTool "$APK"
python3 "$ROOT/tools/verify_apk.py" "$APK"

echo
echo "== 완료: $APK"
ls -lh "$APK"
