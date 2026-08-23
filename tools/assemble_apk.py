#!/usr/bin/env python3
"""aapt2 가 만든 base.apk 에 classes.dex 와 assets/ 를 넣어 최종 APK 를 만든다."""
import argparse
import pathlib
import shutil
import zipfile

STORE_EXT = {'.arsc', '.png', '.jpg', '.jpeg', '.gif', '.ogg', '.mp3', '.mp4', '.webp'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', required=True)
    ap.add_argument('--dex', required=True)
    ap.add_argument('--assets', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.exists():
        out.unlink()

    with zipfile.ZipFile(a.base) as base, zipfile.ZipFile(out, 'w') as zf:
        for info in base.infolist():
            data = base.read(info.filename)
            method = zipfile.ZIP_STORED if info.compress_type == zipfile.ZIP_STORED else zipfile.ZIP_DEFLATED
            zi = zipfile.ZipInfo(info.filename, date_time=(1980, 1, 1, 0, 0, 0))
            zi.compress_type = method
            zi.external_attr = info.external_attr
            zf.writestr(zi, data)

        zi = zipfile.ZipInfo('classes.dex', date_time=(1980, 1, 1, 0, 0, 0))
        zi.compress_type = zipfile.ZIP_DEFLATED
        zf.writestr(zi, pathlib.Path(a.dex).read_bytes())

        root = pathlib.Path(a.assets)
        for p in sorted(root.rglob('*')):
            if not p.is_file():
                continue
            name = 'assets/' + p.relative_to(root).as_posix()
            zi = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            zi.compress_type = (zipfile.ZIP_STORED if p.suffix.lower() in STORE_EXT
                                else zipfile.ZIP_DEFLATED)
            zf.writestr(zi, p.read_bytes())

    print('   APK 조립됨:', out)


if __name__ == '__main__':
    main()
