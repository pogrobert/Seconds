import json,sys,collections
rows=json.load(open(sys.argv[1]+'/rows.json'))
G=[('Extra things packed into a section (logos, stats, badges, facts, forms, lists)',['logo strip','statistic','badge','business facts','form inside','bullet list inside','quote and booking','six buttons','partner logo','list of items inside','image strip','promo, gallery','3+ links','two sub-lists','app store']),
('Prices that need more than one price per item',['price table','prices per team','prices set for','modifiers']),
('Slideshows and rotating content',['slideshow','rotating','several announcements']),
('Big navigation and in-page navigation',['mega-menu','very large menu','jump links','site search','search box','filter buttons']),
('Site-level features, not sections',['two businesses','sticky mobile','pop-up','share buttons','sidebar']),
('Media the draft lacks',['video','before-and-after','image-only']),
('One-offs',['route-planner','dated events','64 items','terms checkbox']),
('Third-party widgets (later: embeds)',['reviews widget','Instagram','booking','Wodify','timetable (']),
('Online shop (later)',['online shop'])]
def grp(g):
    for name,keys in G:
        if any(k in g for k in keys): return name
    return 'UNGROUPED: '+g
c=collections.Counter(); kinds=collections.defaultdict(set); ex=collections.defaultdict(collections.Counter)
for r in rows:
    if r['status'] in('stretch','none','later'):
        n=grp(r['gap']); c[n]+=1; kinds[n].add(r['kind']); ex[n][r['gap']]+=1
for n,v in c.most_common(): print(v,'|',len(kinds[n]),'|',n,'|','; '.join(f'{g} ({k})' for g,k in ex[n].most_common()))
