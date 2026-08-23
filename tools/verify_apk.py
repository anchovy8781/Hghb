#!/usr/bin/env python3
"""빌드된 APK 가 설치 가능한 모양새인지 확인한다."""
import struct
import sys
import zipfile


def main(apk):
    z = zipfile.ZipFile(apk)
    names = z.namelist()
    need = ['AndroidManifest.xml', 'classes.dex', 'resources.arsc', 'assets/web/index.html']
    missing = [n for n in need if n not in names]
    print('   포함 파일 수:', len(names))
    print('   게임 에셋:', sum(1 for n in names if n.startswith('assets/web/')), '개')
    if missing:
        print('   [!] 빠진 파일:', missing)
        return 1

    info = z.getinfo('resources.arsc')
    if info.compress_type != zipfile.ZIP_STORED:
        print('   [!] resources.arsc 가 압축되어 있습니다 (targetSdk 30+ 에서 설치 거부)')
        return 1
    with open(apk, 'rb') as fh:
        data = fh.read()
    n, e = struct.unpack_from('<HH', data, info.header_offset + 26)
    off = info.header_offset + 30 + n + e
    if off % 4:
        print('   [!] resources.arsc 4바이트 정렬 실패')
        return 1
    print('   resources.arsc: 무압축 · 4바이트 정렬 OK')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
