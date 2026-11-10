#!/usr/bin/env python3
"""Builds web/tafsir.json (Tafsir al-Muyassar) as [[ayah text, ...] per surah].

Input: the tafsir/ar-tafsir-muyassar folder of github.com/spa5k/tafsir_api (MIT; text sourced from
Quran.com's QUL). Checks that every ayah of web/quran.json has an entry.
Usage: build_tafsir.py path/to/tafsir/ar-tafsir-muyassar
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
quran = json.load(open(os.path.join(ROOT, 'web', 'quran.json'), encoding='utf-8'))
out, missing = [], []
for s in range(1, 115):
    rows = json.load(open(os.path.join(src, f'{s}.json'), encoding='utf-8'))
    by_ayah = {int(r['ayah']): r['text'] for r in rows if int(r['surah']) == s}
    n = len(quran[s - 1][2])
    texts = []
    for a in range(1, n + 1):
        t = (by_ayah.get(a) or '').strip()
        if not t:
            missing.append(f'{s}:{a}')
        t = re.sub(r'\r', '', t)
        t = re.sub(r'\n{3,}', '\n\n', t)
        texts.append(t)
    out.append(texts)
path = os.path.join(ROOT, 'web', 'tafsir.json')
json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('surahs', len(out), 'ayat', sum(map(len, out)), 'missing', len(missing), missing[:10], 'bytes', os.path.getsize(path))
