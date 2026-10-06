# Widens the slits between the blades of a wing mark, leaving the outer silhouette, tips and heel untouched.
# Usage (needs shapely + svgpathtools):  python scripts/widen-wing-gaps.py <in.svg> <out-prefix> <extra-width> [...]
#   writes <out-prefix>-plus<extra-width>.svg; extra-width is added to each slit in viewBox units.
# The widening fades in from each slit's mouth and scales with the slit's own width, so roots stay pointed.
import re, sys
from svgpathtools import parse_path
from shapely.geometry import Polygon
from shapely.validation import make_valid
src = open(sys.argv[1]).read()
d = re.search(r'<path[^>]* d="([^"]+)"', src).group(1)
poly = re.search(r'points="([^"]+)"', src).group(1)
P = parse_path(d)
subs = P.continuous_subpaths()
def sample(sp, step=0.25):
    pts=[]
    for seg in sp:
        n=max(2,int(seg.length()/step)+1)
        for i in range(n): z=seg.point(i/n); pts.append((z.real,z.imag))
    return pts

from shapely.ops import unary_union
from shapely.geometry import MultiPolygon
main = Polygon(sample(subs[0]))
holes = [make_valid(Polygon(sample(s))) for s in subs[1:]]
speck = Polygon([tuple(map(float, p.split())) for p in re.findall(r'[-\d.]+ [-\d.]+', poly)])
shape = unary_union([main.difference(unary_union(holes)), speck])
closed = shape.buffer(7, quad_segs=16).buffer(-7, quad_segs=16)
gaps = [g for g in getattr(closed.difference(shape), 'geoms', [closed.difference(shape)]) if g.area > 15]
print('gap pieces', len(gaps), 'total gap area', round(sum(g.area for g in gaps), 1))
vb = re.search(r'viewBox="([^"]+)"', src).group(1)
def emit(geom, path):
    geoms = getattr(geom, 'geoms', [geom])
    d = ''
    for g in geoms:
        g = g.simplify(0.04)
        for ring in [g.exterior, *g.interiors]:
            c = list(ring.coords)[:-1]
            d += 'M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in c) + 'Z'
    open(path, 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<svg id="a" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n  <defs>\n    <style>\n      .b {{\n        fill: #090d0d;\n      }}\n    </style>\n  </defs>\n  <path class="b" d="{d}"/>\n</svg>\n')
for amt in [float(a) for a in sys.argv[3:]]:
    # fade the widening in from the slit mouth: parts deeper inside the wing get trimmed more
    # ...and only where the slit already has some width, so the tapered roots stay pointed
    G = unary_union(gaps + [h for h in holes if h.area > 1]); D, K, W = 16, 28, 0.55; trims = []
    for k in range(1, K + 1):
        w = W * k / K
        wide = G.buffer(-w, quad_segs=8).buffer(w, quad_segs=8)
        deep = wide.intersection(closed.buffer(-D * (k - 1) / K, quad_segs=8))
        if not deep.is_empty: trims.append(deep.buffer(amt / 2 * k / K, quad_segs=8))
    out = shape.difference(unary_union(trims))
    emit(out, f'{sys.argv[2]}-plus{amt:g}.svg')
    print('wrote', amt, 'area change', round(out.area - shape.area, 1))
