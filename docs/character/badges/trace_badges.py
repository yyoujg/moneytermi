"""배지 기준 이미지(ref-badges.png)를 수달과 같은 방식으로 벡터 추적해 SVG로 만든다.
trace.py(수달)와 같은 레이어 구조: 실루엣(선) → 몸 → 크림.
- 일반본 / 32px 단순화본(선 굵게) / 다크본(흰 외곽 스티커) / 잠김본(회색)
- 기준 이미지의 흰 하이라이트·노란 동전은 크림으로 흡수해 3색만 남긴다.
"""
import cv2, numpy as np, potrace
from pathlib import Path

COL = {'line': '#2B211C', 'body': '#A9774F', 'cream': '#FBEBD3', 'sticker': '#FFFFFF'}
LOCK = {'line': '#B0B8C1', 'body': '#D1D6DB', 'cream': '#E5E8EB'}
NAMES = ['word1', 'word10', 'word50', 'word100', 'streak3',
         'streak7', 'streak30', 'xp100', 'xp500', 'xp1000']

im = cv2.imread('ref-badges.png').astype(np.int32)
refs = np.array([[255, 255, 255], [97, 110, 128], [221, 244, 251], [5, 5, 6]])  # BGR: bg, body, cream, line
d = ((im[:, :, None, :] - refs[None, None]) ** 2).sum(-1)
cls = cv2.medianBlur(d.argmin(-1).astype(np.uint8), 5)
body = cls == 1; cream = cls == 2
fg = (cls != 0).astype(np.uint8)

n, lab, st, cen = cv2.connectedComponentsWithStats(fg, 8)
big = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 3000]
big.sort(key=lambda i: cen[i][0])
assert len(big) == 10, len(big)
owner = {i: min(big, key=lambda b: np.hypot(*(cen[i] - cen[b])))
         for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= 30}

def fill_holes(m):
    m = m.astype(np.uint8); h, w = m.shape
    ff = m.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 1)
    return m | (1 - ff)

def trace(mask, scale):
    if mask.sum() == 0: return ''
    plist = potrace.Bitmap(~mask.astype(bool)).trace(turdsize=6, alphamax=1.1, opticurve=True, opttolerance=0.3)
    f = lambda p: f'{p.x * scale:.1f} {p.y * scale:.1f}'
    out = []
    for c in plist:
        s = f'M{f(c.start_point)}'
        for seg in c.segments:
            s += f'L{f(seg.c)} L{f(seg.end_point)}' if seg.is_corner else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}'
        out.append(s + 'Z')
    return ''.join(out)

out = Path('svg'); out.mkdir(exist_ok=True)
SIZE = 120
SHRINK = {'streak3': 0.72}
for k, b in enumerate(big):
    sel = np.isin(lab, [i for i, o in owner.items() if o == b])
    ys, xs = np.where(sel)
    pad = 20
    side = max(ys.max() - ys.min(), xs.max() - xs.min()) + 2 * pad
    side = int(side / SHRINK.get(NAMES[k], 1.0))   # 단계 차이를 크기로 보여줄 배지만 작게
    cy, cx = (ys.min() + ys.max()) // 2, (xs.min() + xs.max()) // 2
    y0, x0 = cy - side // 2, cx - side // 2
    crop = lambda m: np.pad(m, side)[y0 + side:y0 + 2 * side, x0 + side:x0 + 2 * side]
    S = fill_holes(crop(sel))
    B = crop(body & sel).astype(np.uint8)
    C = crop(cream & sel).astype(np.uint8)
    hole = (S == 1) & (crop(cls) == 0)          # 실루엣 안의 흰 하이라이트 → 크림
    C = C | hole.astype(np.uint8)
    sc = SIZE / side

    def svg(variant):
        col = LOCK if variant == 'locked' else COL
        Bv, Cv = B, C
        if variant == 'small':
            ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            Bv = cv2.erode(B, ker); Cv = cv2.erode(C, ker)
        layers = ''
        if variant == 'dark':
            ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
            layers += f'<path d="{trace(cv2.dilate(S, ker), sc)}" fill="{COL["sticker"]}"/>'
        layers += f'<path d="{trace(S, sc)}" fill="{col["line"]}"/>'
        layers += f'<path d="{trace(Bv, sc)}" fill="{col["body"]}"/>'
        layers += f'<path d="{trace(Cv, sc)}" fill="{col["cream"]}"/>'
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" fill-rule="evenodd">{layers}</svg>\n'

    for v, suf in [('normal', ''), ('small', '-small'), ('dark', '-dark'), ('locked', '-locked')]:
        (out / f'badge-{NAMES[k]}{suf}.svg').write_text(svg(v))
    print(NAMES[k], 'done')
