"""Re-score every section under the rules settled on 2026-11-14 (see 0001-section-types.md, "Answers").

Run after tally.py:  python3 tally.py . && python3 rescore.py .
New verdicts:
  clean    fits one section type
  split    fits as two neighbouring sections (the extra moves to its own band)
  linkout  fits by linking to the outside service instead of embedding it
  stretch  fits, but something visible is lost
  out      not supported, by decision
  later    planned for a later milestone
"""
import json, sys, collections

RULES = [  # (substring of the recorded gap, new verdict)
    ('logo strip', 'split'), ('statistic', 'split'), ('badge', 'split'), ('business facts inside', 'split'),
    ('form inside', 'split'), ('bullet list inside the hero', 'split'), ('quote and booking widget', 'split'),
    ('partner logo plus numbered steps', 'split'), ('list of items inside', 'split'), ('image strip under cards', 'split'),
    ('promo, gallery and named contacts', 'split'), ('app store badges', 'split'),
    ('two sub-lists', 'clean'),                      # cards items carry a group
    ('price table with several price columns', 'clean'), ('prices per team member', 'clean'),
    ('prices set for a whole group', 'clean'), ('modifiers', 'clean'),
    ('hero slideshow', 'clean'),                     # hero takes a gallery of 2-3 images, shown together
    ('image-only hero', 'clean'),                    # a photo band is a gallery section
    ('jump links', 'clean'),                         # automatic "On this page" links on long sections
    ('sticky mobile bar', 'clean'),                  # a site setting, drawn by the page shell
    ('third-party reviews widget', 'linkout'), ('Instagram', 'linkout'), ('booking', 'linkout'), ('Wodify', 'linkout'),
    ('two businesses on one site', 'out'), ('pop-up', 'out'), ('share buttons', 'out'), ('sidebar', 'out'),
    ('site search', 'out'), ('search box that filters', 'out'),
    ('video', 'later'), ('online shop', 'later'),
]

def verdict(r):
    if r['status'] in ('clean', 'skip'):
        return r['status']
    for key, v in RULES:
        if key in r['gap']:
            return v
    return 'stretch'

rows = json.load(open(sys.argv[1] + '/rows.json'))
for r in rows:
    r['new'] = verdict(r)
c = [r for r in rows if r['new'] != 'skip']
order = ['clean', 'split', 'linkout', 'stretch', 'out', 'later']
names = {'restaurant-cafe': 'Restaurant or café', 'salon': 'Hair and beauty salon', 'clinic': 'Dental or clinic',
         'trades': 'Trades', 'fitness': 'Fitness or yoga'}
print('| Kind | Sections | ' + ' | '.join(o.capitalize() for o in order) + ' | Fits (clean + split + link-out) |')
print('|---|---|' + '---|' * len(order) + '---|')
def line(name, rs):
    n = collections.Counter(r['new'] for r in rs)
    fit = n['clean'] + n['split'] + n['linkout']
    print(f"| {name} | {len(rs)} | " + ' | '.join(str(n[o]) for o in order) + f" | **{100*fit/len(rs):.0f}%** |")
for k, nm in names.items():
    line(nm, [r for r in c if r['kind'] == k])
line('**All**', c)
print('\nStill stretch, out or later:')
for (v, g), n in collections.Counter((r['new'], r['gap']) for r in c if r['new'] in ('stretch', 'out', 'later')).most_common():
    print(f'  {n} {v}: {g}')
