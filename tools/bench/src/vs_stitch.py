# Stitches screen-by-screen screenshots of one page into a single full-page image
# (docs/m0/21-vs-lovable-v0.md). Lovable and v0 previews can only be captured in Chrome one
# screen at a time, so each shot overlaps the one before; the overlap is found by matching pixels,
# which also skips a header that stays fixed at the top of every shot.
#   python3 vs_stitch.py OUT.png shot1.jpg shot2.jpg ...
import sys
from PIL import Image, ImageChops, ImageStat

out, files = sys.argv[1], sys.argv[2:]
# Shots taken by script carry their scroll position: file.jpg@700 (CSS pixels), plus --scale for
# image pixels per CSS pixel. Those are placed exactly; matching is only for shots without one
# (v0's frame, scrolled by mouse wheel), because repeated rows such as a menu can match wrongly.
scale = 1.0
if files[0] == '--scale':
    scale, files = float(files[1]), files[2:]
at = [round(int(f.rsplit('@', 1)[1]) * scale) if '@' in f else None for f in files]
files = [f.rsplit('@', 1)[0] for f in files]
# The right 16px are cut from every shot: v0's frame shows a scrollbar there.
shots = [(lambda im: im.crop((0, 0, im.width - 16, im.height)))(Image.open(f).convert('RGB')) for f in files]
W, H = shots[0].size
SMALL = 160  # matching runs on small grey copies


def small(im):
    return im.convert('L').resize((SMALL, round(im.height * SMALL / im.width)))


def shift(prev, nxt):
    """How far nxt is scrolled past prev, in pixels, or None if they share nothing."""
    a, b = small(prev), small(nxt)
    h = a.height
    top = round(h * 0.12)  # skip a header fixed at the top of every shot
    best, best_s = None, None
    # The whole overlap is compared, so large plain areas can't match at the wrong place.
    for s in range(0, h - top - round(h * 0.15)):
        ref = a.crop((0, top + s, SMALL, h))
        cut = b.crop((0, top, SMALL, h - s))
        d = ImageStat.Stat(ImageChops.difference(ref, cut)).mean[0]
        if best is None or d < best - 0.05:
            best, best_s = d, s
    if best is None or best > 4:
        return None
    return round(best_s * prev.width / SMALL)


if all(y is not None for y in at):
    page = Image.new('RGB', (W, at[-1] + H), 'white')
    for im, y in zip(shots, at):
        page.paste(im, (0, y))
    page.save(out)
    print(out, page.size)
    sys.exit()

page = shots[0]
for nxt in shots[1:]:
    last = page.crop((0, page.height - H, W, page.height))
    s = shift(last, nxt)
    if s is None:
        print('no overlap found; stopping', file=sys.stderr)
        break
    if s == 0:
        continue  # the page did not move: end of page
    grown = Image.new('RGB', (W, page.height + s), 'white')
    grown.paste(page, (0, 0))
    grown.paste(nxt.crop((0, H - s, W, H)), (0, page.height))
    page = grown
page.save(out)
print(out, page.size)
