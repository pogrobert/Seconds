# Writes src/descriptions.json: each block component's one-line description, taken from the comment
# above it, for Jev to read when it picks blocks (docs/m0/23-jev-does-more.md).
#   python3 scripts/describe.py
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'blocks'
out = {}
for f in sorted(root.rglob('*.tsx')):
    s = f.read_text()
    for m in re.finditer(r'/\*\*((?:(?!\*/).)*?)\*/\s*export (?:function|const) (\w+)', s, re.S):
        text = ' '.join(l.strip().lstrip('*').strip() for l in m.group(1).splitlines()).strip()
        # Drop the source credit in brackets at the end: "(Mist, hero one)".
        text = re.sub(r'\s*\([^()]*\)\.?$', '', text).rstrip('.')
        out[m.group(2)] = text
(root.parent / 'descriptions.json').write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print(len(out))
