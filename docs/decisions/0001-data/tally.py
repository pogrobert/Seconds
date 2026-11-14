import json,sys,csv,collections,os
S=sys.argv[1]; kinds=['restaurant-cafe','salon','clinic','trades','fitness']
names={'restaurant-cafe':'Restaurant / café','salon':'Hair & beauty salon','clinic':'Dental / clinic','trades':'Trades','fitness':'Fitness / yoga'}
rows=[]; problems=[]
for k in kinds:
    d=json.load(open(f'{S}/sites/{k}.json'))
    m=[l.rstrip('\n').split('\t') for l in open(f'{S}/map/{k}.tsv') if l.strip()]
    flat=[(i+1,x) for i,s in enumerate(d['sites']) for x in s['sections']]
    if len(flat)!=len(m): problems.append(f'{k}: {len(flat)} sections vs {len(m)} rows')
    for (si,x),r in zip(flat,m):
        if int(r[0])!=si or int(r[2])!=x['order']: problems.append(f'{k}: mismatch site {si} order {x["order"]} vs {r[:3]}')
        rows.append(dict(kind=k,site=si,sitename=d['sites'][si-1]['name'],url=d['sites'][si-1]['url'],page=r[1],order=r[2],type=r[3],status=r[4],gap=(r[5] if len(r)>5 else '')))
print('PROBLEMS',problems)
json.dump(rows,open(f'{S}/rows.json','w'))
st=['clean','stretch','none','later','skip']
print('\nkind | sites | sections | '+' | '.join(st))
tot=collections.Counter()
for k in kinds:
    c=collections.Counter(r['status'] for r in rows if r['kind']==k); tot+=c
    print(names[k],'|',len({r['site'] for r in rows if r['kind']==k}),'|',sum(c.values()),'|',' | '.join(str(c[s]) for s in st))
print('ALL | 40 |',sum(tot.values()),'|',' | '.join(str(tot[s]) for s in st))
print('\nby type (counted = not skip):')
bt=collections.defaultdict(collections.Counter)
for r in rows:
    if r['status']!='skip': bt[r['type']][r['status']]+=1
for t,c in sorted(bt.items(),key=lambda kv:-sum(kv[1].values())):
    kinds_with={r['kind'] for r in rows if r['type']==t and r['status']!='skip'}
    print(f"{t:15} {sum(c.values()):4}  clean {c['clean']:3} stretch {c['stretch']:3} later {c['later']:2} none {c['none']:2}  kinds {len(kinds_with)}")
print('\ngaps:')
g=collections.Counter((r['status'],r['gap']) for r in rows if r['status'] in('stretch','none','later'))
gk=collections.defaultdict(set)
for r in rows:
    if r['status'] in('stretch','none','later'): gk[r['gap']].add(r['kind'])
for (s,gp),n in g.most_common(): print(f'{n:3} {s:7} {gp}  [{len(gk[gp])} kinds]')
