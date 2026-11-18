# Adding papers to Tafawoq (tafawoq.site)

Algerian exam papers (فروض واختبارات) with full worked solutions, from 1AP to 3AS.

## Where files go

`content/papers/<level>/<subject>/<exam|test>/<name>.html`

- Levels: `1ap`–`5ap` (primary), `1am`–`4am` (middle, BEM in 4am), `1as`–`3as` (secondary, BAC in 3as).
- Names: `t1-1`, `t1-2`… for term 1 (`t2-…`, `t3-…` for later terms). Always take the next free number;
  never overwrite an existing file.
- Look at the existing files of a folder (`ls`, `head -1` for the topics) before writing, so you do not repeat a
  topic.

## Points

- Primary (`1ap`–`5ap`): each paper totals **10**.
- Middle and secondary: each paper totals **20**.
- Every exercise's points must equal the sum of its solution's `data-pts` values (`"3×1"` style is allowed).

## How to write

Use `tools/paperlib.py` (run Python from the `tools/` folder or add it to `sys.path`):

```python
import sys; sys.path.insert(0, 'tools')
from paperlib import paper, OL, box, poem
paper('4am/math/exam/t1-7.html',
  {"title": "اختبار الفصل الأول في الرياضيات (النموذج 7) — السنة الرابعة متوسط", "duration": "ساعتان", "term": 1,
   "topics": ["...", "..."]},
  None,                       # or box([...paragraphs]) / poem(intro, [(sadr, ajz), ...]) for a reading text
  [("التمرين الأول", 3, "<p>question html</p>", [("1.5", "answer"), ("1.5", "answer")]),
   ...])
```

- `lang='fr'` or `lang='en'` for French/English papers; the text box then uses `box([...], ltr=True)`.
- Titles follow the pattern «اختبار/فرض الفصل الأول في <المادة> (النموذج N) — <المستوى>».
- Content must be original, accurate and consistent with the Algerian programme for that level and term.
  Double-check every calculation and every historical date. Quote only Qur'an verses or poetry published before
  1929; no copyrighted texts.

## Check, build, publish

```bash
python3 tools/check_papers.py content/papers/<new files...>   # must print "bad 0"
npm run papers -- <level>        # once per level you touched (regenerates the PDFs)
npm run index
npm run build:static             # must succeed
git add -A && git commit -m "Add N papers: ..." && git push origin main
```

Cloudflare Pages deploys `main` automatically. Confirm with
`gh api repos/cbousnina9-alt/tafawoq/commits/<sha>/check-runs` (status `completed`, conclusion `success`). If no
check run appears after a few minutes, push an empty commit (`git commit --allow-empty -m "Trigger deploy"`).
