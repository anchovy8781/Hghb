#!/usr/bin/env python3
"""순수 파이썬 zipalign.

압축하지 않고 저장(STORED)한 엔트리의 데이터 시작 위치를 4바이트 경계에 맞춘다.
resources.arsc 는 targetSdk 30+ 에서 반드시 정렬되어 있어야 한다.
"""
import struct
import sys
import zipfile

ALIGN = 4


def align_zip(src, dst):
    with zipfile.ZipFile(src) as zin, open(dst, 'wb') as out:
        entries = []
        for info in zin.infolist():
            data = zin.read(info.filename)
            name = info.filename.encode('utf-8')
            stored = info.compress_type == zipfile.ZIP_STORED
            if stored:
                payload = data
            else:
                import zlib
                co = zlib.compressobj(9, zlib.DEFLATED, -15)
                payload = co.compress(data) + co.flush()

            header_len = 30 + len(name)
            extra = b''
            if stored:
                pad = (-(out.tell() + header_len)) % ALIGN
                extra = b'\x00' * pad

            offset = out.tell()
            crc = zipfile.crc32(data) & 0xFFFFFFFF
            out.write(struct.pack('<IHHHHHIIIHH', 0x04034B50, 20, 0,
                                  0 if stored else 8, 0, 0x21,
                                  crc, len(payload), len(data),
                                  len(name), len(extra)))
            out.write(name)
            out.write(extra)
            out.write(payload)
            entries.append((name, extra, crc, len(payload), len(data), stored, offset,
                            info.external_attr))

        cd_start = out.tell()
        for name, extra, crc, csize, size, stored, offset, attr in entries:
            out.write(struct.pack('<IHHHHHHIIIHHHHHII', 0x02014B50, 20, 20, 0,
                                  0 if stored else 8, 0, 0x21,
                                  crc, csize, size, len(name), len(extra), 0, 0, 0,
                                  attr, offset))
            out.write(name)
            out.write(extra)
        cd_end = out.tell()
        out.write(struct.pack('<IHHHHIIH', 0x06054B50, 0, 0, len(entries), len(entries),
                              cd_end - cd_start, cd_start, 0))


if __name__ == '__main__':
    align_zip(sys.argv[1], sys.argv[2])
    print('   정렬 완료:', sys.argv[2])
