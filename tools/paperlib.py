import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content', 'papers')

def ar(p):
    p = int(p) if float(p).is_integer() else p
    if p == 20: return '20 نقطة'
    if p >= 11: return f'{p} نقطة'
    return f'{p:02d} نقاط' if isinstance(p, int) else f'{p} نقاط'

def paper(path, meta, intro, exs, lang=None):
    """intro: html placed before exercises (text box). exs: (title, pts, q_html, [(pts, ans)])"""
    lab = (lambda p: f'{p} pts') if lang == 'en' else (lambda p: f'{p} points') if lang == 'fr' else ar
    open_ltr = f'<div dir="ltr" lang="{lang}" style="text-align:left">' if lang else None
    o = [f'<!-- {json.dumps(meta, ensure_ascii=False)} -->', '', '<section class="paper">']
    if open_ltr: o.append(open_ltr)
    if intro: o += [intro, '']
    for t, p, q, _ in exs:
        o += ['<div class="ex">', f'<h2>{t} <span class="pts">({lab(p)})</span></h2>', q, '</div>', '']
    if open_ltr: o.append('</div>')
    o += ['</section>', '', '<section class="solution">']
    if open_ltr: o.append(open_ltr)
    for t, p, _, ans in exs:
        o += [f'<div class="ex" data-total="{p}">', f'<h2>{t}</h2>'] + [f'<p data-pts="{a}">{b}</p>' for a, b in ans] + ['</div>']
    if open_ltr: o.append('</div>')
    o.append('</section>')
    full = os.path.join(ROOT, path)
    assert not os.path.exists(full), full
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write('\n'.join(o) + '\n')

def poem(intro, lines):
    return f'<div class="ex">\n<h2>النص</h2>\n<p>{intro}</p>\n<div class="text-box" style="text-align:center">\n' + '\n'.join(f'<p>{a} ... {b}</p>' for a, b in lines) + '\n</div>\n</div>'

def box(paras, ltr=False):
    d = ' dir="ltr"' if ltr else ''
    return f'<div class="text-box"{d}>\n' + '\n'.join(f'<p>{p}</p>' for p in paras) + '\n</div>'

OL = lambda items: '<ol>\n' + '\n'.join(f'<li>{i}</li>' for i in items) + '\n</ol>'

