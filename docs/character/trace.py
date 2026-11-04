"""AI 기준 이미지(ref.png)를 색 영역별로 벡터 추적해 SVG로 만든다.
레이어: 실루엣(선 색) → 몸(몸 색) → 크림 → 그 사이 틈이 손그림 선이 된다.
- 일반본: 원본 선 굵기 그대로
- 32px본: 몸·크림 영역을 깎아 선을 굵게
- 다크본: 실루엣을 팽창시킨 흰 외곽선 도형을 뒤에 깐다(필터 없이 path만 → RN에서도 동작)
"""
import cv2, numpy as np, potrace
from pathlib import Path

COL = {'line': '#1F1A17', 'body': '#8C7C6D', 'cream': '#F8EFDE', 'sticker': '#FFFFFF'}
NAMES = ['idle', 'cheer', 'explain', 'shock', 'defeat']

im = cv2.imread('ref.png').astype(np.int32)
refs = np.array([[255, 255, 255], [109, 123, 139], [221, 238, 247], [5, 5, 6]])     # BGR: bg, body, cream, line
d = ((im[:, :, None, :] - refs[None, None]) ** 2).sum(-1)
cls = d.argmin(-1).astype(np.uint8)
cls = cv2.medianBlur(cls, 5)
dark = cls == 3; body = cls == 1; cream = cls == 2
fg = (cls != 0).astype(np.uint8)

# 포즈별 분리: 큰 덩어리 = 몸, 작은 덩어리(효과선)는 가장 가까운 몸에 붙임
n, lab, st, cen = cv2.connectedComponentsWithStats(fg, 8)
big = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 15000]
big.sort(key=lambda i: cen[i][0])
assert len(big) == 5, len(big)
owner = {}
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] < 30: continue
    owner[i] = min(big, key=lambda b: np.hypot(*(cen[i] - cen[b])))

def fill_holes(m):
    m = m.astype(np.uint8); h, w = m.shape
    ff = m.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 1)
    return m | (1 - ff)

def trace(mask, scale, ox, oy):
    if mask.sum() == 0: return ''
    bm = potrace.Bitmap(~mask.astype(bool))
    plist = bm.trace(turdsize=6, alphamax=1.1, opticurve=True, opttolerance=0.3)
    f = lambda p: f'{(p.x - ox) * scale:.1f} {(p.y - oy) * scale:.1f}'
    out = []
    for c in plist:
        s = f'M{f(c.start_point)}'
        for seg in c.segments:
            s += (f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}' if not seg.is_corner
                  else f'L{f(seg.c)} L{f(seg.end_point)}')
        out.append(s + 'Z')
    return ''.join(out)

out = Path('svg'); out.mkdir(exist_ok=True)
SIZE = 120  # 출력 viewBox 한 변
for k, b in enumerate(big):
    sel = np.isin(lab, [i for i, o in owner.items() if o == b])
    ys, xs = np.where(sel)
    pad = 24
    y0, y1, x0, x1 = ys.min() - pad, ys.max() + pad, xs.min() - pad, xs.max() + pad
    side = max(y1 - y0, x1 - x0)
    cy, cx = (y0 + y1) // 2, (x0 + x1) // 2
    y0, x0 = cy - side // 2, cx - side // 2
    crop = lambda m: np.pad(m, side)[y0 + side:y0 + 2 * side, x0 + side:x0 + 2 * side]
    S = fill_holes(crop(sel))
    B = crop(body & sel); C = crop(cream & sel)
    sc = SIZE / side

    def svg(variant):
        Bv, Cv = B, C
        if variant == 'small':      # 선을 굵게: 면을 깎는다
            ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
            Bv = cv2.erode(B.astype(np.uint8), ker); Cv = cv2.erode(C.astype(np.uint8), ker)
        layers = ''
        if variant == 'dark':
            ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
            layers += f'<path d="{trace(cv2.dilate(S.astype(np.uint8), ker), sc, 0, 0)}" fill="{COL["sticker"]}"/>'
        layers += f'<path d="{trace(S, sc, 0, 0)}" fill="{COL["line"]}"/>'
        layers += f'<path d="{trace(Bv, sc, 0, 0)}" fill="{COL["body"]}"/>'
        layers += f'<path d="{trace(Cv, sc, 0, 0)}" fill="{COL["cream"]}"/>'
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" fill-rule="evenodd">{layers}</svg>\n'

    for v, suf in [('normal', ''), ('small', '-small'), ('dark', '-dark')]:
        (out / f'otter-{NAMES[k]}{suf}.svg').write_text(svg(v))
    print(NAMES[k], 'done')
