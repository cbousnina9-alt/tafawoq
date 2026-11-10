#!/usr/bin/env python3
"""Builds web/adhkar.json.

Inputs:
  hisn.json  - Hisn al-Muslim, from github.com/asellam/HisnElMuslim (MIT)
  web/quran.json - the app's mushaf text, used for the Quranic duas so they match it exactly
Usage: build_adhkar.py path/to/hisn.json
"""
import json, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hisn = json.load(open(sys.argv[1], encoding='utf-8'))
quran = json.load(open(os.path.join(ROOT, 'web', 'quran.json'), encoding='utf-8'))
chapters = list(hisn.items())

def clean(t):
    t = t.replace('\r', '').strip()
    t = re.sub(r'\s*\{\s*', ' ﴿', t)
    t = re.sub(r'\s*\}\s*', '﴾ ', t)
    t = re.sub(r'\s*\*\s*', ' ۝ ', t)
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\s*\n\s*', '\n', t)
    return t.strip()

def items(ch):
    return [{'t': clean(x['Text']), 'n': int(x.get('Count') or 1), 'r': clean(x.get('Reference') or '')} for x in ch['Adhkar']]

def find(title_part):
    for i, (k, v) in enumerate(chapters):
        if title_part in re.sub(r'[ً-ْٰـ]', '', k):
            return i
    raise SystemExit('chapter not found: ' + title_part)

featured = []
for cid, label, key in [
    ('morning', 'أذكار الصباح', 'أذكار الصباح'),
    ('evening', 'أذكار المساء', 'أذكار المساء'),
    ('prayer', 'أذكار بعد الصلاة', 'الأذكار بعد السلام من الصلاة'),
    ('sleep', 'أذكار النوم', 'أذكار النوم'),
    ('wake', 'أذكار الاستيقاظ', 'أذكار الاستيقاظ من النوم'),
]:
    i = find(key)
    featured.append({'id': cid, 'title': label, 'items': items(chapters[i][1]), 'src': 'حصن المسلم'})

# Quranic duas: [surah, first ayah, last ayah, start word (diacritics-free) or None for whole ayah, which occurrence]
QD = [
    (1, 6, 7, None),
    (2, 127, 128, 'ربنا'), (2, 201, 201, 'ربنا'), (2, 250, 250, 'ربنا'), (2, 286, 286, 'ربنا'),
    (3, 8, 9, None), (3, 16, 16, 'ربنا'), (3, 38, 38, 'رب'), (3, 53, 53, None), (3, 147, 147, 'ربنا'),
    (3, 191, 194, 'ربنا'), (7, 23, 23, 'ربنا'), (7, 126, 126, 'ربنا', 2), (7, 151, 151, 'رب'),
    (10, 85, 86, 'ربنا'), (14, 40, 41, None), (17, 24, 24, 'رب'), (17, 80, 80, 'رب'),
    (18, 10, 10, 'ربنا'), (20, 25, 28, 'رب'), (20, 114, 114, 'رب'), (21, 83, 83, 'أني'),
    (21, 87, 87, 'لا'), (21, 89, 89, 'رب'), (23, 97, 98, 'رب'), (23, 109, 109, 'ربنا'),
    (23, 118, 118, 'رب'), (25, 65, 66, 'ربنا'), (25, 74, 74, 'ربنا'), (26, 83, 85, None),
    (27, 19, 19, 'رب'), (28, 16, 16, 'رب'), (28, 24, 24, 'رب'), (40, 7, 9, 'ربنا'),
    (46, 15, 15, 'رب'), (59, 10, 10, 'ربنا'), (60, 4, 5, 'ربنا'), (66, 8, 8, 'ربنا'), (71, 28, 28, None),
]
AR = '٠١٢٣٤٥٦٧٨٩'
ar = lambda n: ''.join(AR[int(c)] for c in str(n))
strip = lambda w: re.sub(r'[ؐ-ًؚ-ٰٟۖ-ۭـ]', '', w).replace('ٱ', 'ا')

quran_items = []
for entry in QD:
    s, a1, a2, start = entry[:4]
    nth = entry[4] if len(entry) > 4 else 1
    name, _, verses = quran[s - 1]
    parts = []
    for a in range(a1, a2 + 1):
        v = verses[a - 1]
        if a == a1 and start:
            words = v.split(' ')
            hits = [k for k, w in enumerate(words) if strip(w) in (start, 'و' + start, 'ف' + start)]
            idx = hits[nth - 1] if len(hits) >= nth else None
            if idx is None:
                raise SystemExit(f'start word {start} not found in {s}:{a}: {v}')
            v = ' '.join(words[idx:])
        parts.append(f'{v} ۝{ar(a)}')
    ref = f'سورة {name}، الآية {ar(a1)}' if a1 == a2 else f'سورة {name}، الآيات {ar(a1)}–{ar(a2)}'
    quran_items.append({'t': ' '.join(parts), 'n': 1, 'r': ref, 'q': 1})
featured.append({'id': 'quran', 'title': 'أدعية قرآنية', 'items': quran_items, 'src': 'القرآن الكريم'})

used = {find(k) for k in ['أذكار الصباح', 'أذكار المساء', 'الأذكار بعد السلام من الصلاة', 'أذكار النوم', 'أذكار الاستيقاظ من النوم']}
hisn_out = [{'id': f'h{i}', 'title': k.replace('ـ', ''), 'items': items(v)} for i, (k, v) in enumerate(chapters)]

out = {'featured': featured, 'hisn': hisn_out,
       'credits': 'حصن المسلم للشيخ سعيد بن علي بن وهف القحطاني، النص من مستودع asellam/HisnElMuslim (MIT). الأدعية القرآنية من نص المصحف في التطبيق.'}
path = os.path.join(ROOT, 'web', 'adhkar.json')
json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('featured:', [(f['id'], len(f['items'])) for f in featured])
print('hisn chapters:', len(hisn_out), 'items:', sum(len(c['items']) for c in hisn_out), 'bytes:', os.path.getsize(path))
