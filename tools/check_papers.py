import re,sys
tr=str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789')
def num(x):
    m=re.match(r'\s*([\d.]+)\s*[×x]\s*([\d.]+)',x); return round(float(m.group(1))*float(m.group(2)),6) if m else float(x)
bad=0
for f in sys.argv[1:]:
    s=open(f).read(); paper,sol=s.split('<section class="solution">')
    pts=[float(re.match(r'[\d.]+',p.translate(tr).strip()).group()) for p in re.findall(r'class="pts">\(([^)]*)\)',paper)]
    exs=re.findall(r'data-total="([\d.]+)"(.*?)</div>',sol,re.S)
    tot=[float(t) for t,_ in exs]; sums=[round(sum(num(x) for x in re.findall(r'data-pts="([^"]+)"',b)),6) for _,b in exs]
    want=10 if re.search(r'/[1-5]ap/',f) else 20
    ok=pts==tot and tot==sums and sum(tot)==want
    bad+=not ok; print('OK ' if ok else 'BAD', f.split('papers/')[1], sums)
print(len(sys.argv)-1,'files, bad',bad)
