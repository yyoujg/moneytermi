"""수달+소품 상호작용 장면(ref-scenes-*.png)을 수달 v5와 같은 3색 벡터로 추적한다.
사용: python3 trace_scenes.py REF name1,name2,...   (왼쪽→오른쪽 순서)
- 장면 분리: 전경이 없는 세로 열(빈 칸)의 가장 긴 구간 N-1개로 자른다.
- 색 분류: 배경/몸/크림/선 + 황토(동전·상자)→크림, 진회색(배 선체·가방)→선
- 실루엣 안의 작은 흰 구멍(하이라이트·영수증 등)은 크림, 큰 구멍은 투명 유지
출력: svg/scene-{name}.svg (viewBox = 장면 bbox + 여백, 원본 비율 유지)
"""
import sys, json, cv2, numpy as np, potrace
from pathlib import Path

COL = {'line': '#1F1A17', 'body': '#8C7C6D', 'cream': '#F8EFDE'}
ref, names = sys.argv[1], sys.argv[2].split(',')
im = cv2.imread(ref).astype(np.int32)
# BGR: 0 bg, 1 body, 2 cream, 3 line, 4 tan→cream, 5 darkgrey→line, 6 light body→body
refs = np.array([[255, 255, 255], [106, 118, 134], [222, 236, 244], [7, 8, 9], [136, 182, 215], [66, 71, 74], [120, 140, 165]])
d = ((im[:, :, None, :] - refs[None, None]) ** 2).sum(-1)
cls = cv2.medianBlur(d.argmin(-1).astype(np.uint8), 5)
cls[cls == 4] = 2; cls[cls == 5] = 3; cls[cls == 6] = 1
fg = (cls != 0).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

# 장면 분리
col = fg.sum(0) > 0
runs, x = [], 0
while x < len(col):
    if not col[x]:
        s = x
        while x < len(col) and not col[x]: x += 1
        if s > 0 and x < len(col): runs.append((x - s, s, x))
    else: x += 1
cuts = sorted(sorted(runs, reverse=True)[:len(names) - 1], key=lambda r: r[1])
bounds = [0] + [(s + e) // 2 for _, s, e in cuts] + [fg.shape[1]]

def trace(mask, scale, ox, oy):
    if mask.sum() == 0: return ''
    plist = potrace.Bitmap(~mask.astype(bool)).trace(turdsize=8, alphamax=1.1, opticurve=True, opttolerance=0.3)
    f = lambda p: f'{(p.x - ox) * scale:.1f} {(p.y - oy) * scale:.1f}'
    out = []
    for c in plist:
        s = f'M{f(c.start_point)}'
        for seg in c.segments:
            s += f'L{f(seg.c)} L{f(seg.end_point)}' if seg.is_corner else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}'
        out.append(s + 'Z')
    return ''.join(out)

out = Path('svg'); out.mkdir(exist_ok=True)
HOLE_MAX = 2500   # 이보다 작은 흰 구멍만 크림으로 채움
for k, name in enumerate(names):
    x0, x1 = bounds[k], bounds[k + 1]
    sel = np.zeros_like(fg); sel[:, x0:x1] = fg[:, x0:x1]
    n, lab, st, _ = cv2.connectedComponentsWithStats(sel, 8)
    keep = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= 40])
    # 작은 구멍 채우기
    inv = (~keep).astype(np.uint8)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, 4)
    small = np.isin(lab2, [i for i in range(1, n2) if st2[i, cv2.CC_STAT_AREA] < HOLE_MAX
                           and st2[i, cv2.CC_STAT_LEFT] > 0 and st2[i, cv2.CC_STAT_TOP] > 0])
    S = keep | small
    B = (cls == 1) & keep
    C = ((cls == 2) & keep) | small
    ys, xs = np.where(S)
    pad = 12
    bx, by = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    w, h = xs.max() + pad - bx, ys.max() + pad - by
    cr = lambda m: m[by:by + h, bx:bx + w]
    sc = 120 / h                       # 높이를 120으로 정규화
    W = w * sc
    layers = (f'<path d="{trace(cr(S), sc, 0, 0)}" fill="{COL["line"]}"/>'
              f'<path d="{trace(cr(B), sc, 0, 0)}" fill="{COL["body"]}"/>'
              f'<path d="{trace(cr(C), sc, 0, 0)}" fill="{COL["cream"]}"/>')
    (out / f'scene-{name}.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} 120" fill-rule="evenodd">{layers}</svg>\n')
    meta = json.loads(Path('svg/meta.json').read_text()) if Path('svg/meta.json').exists() else {}
    meta[name] = [int(bx), int(by), int(h)]
    Path('svg/meta.json').write_text(json.dumps(meta))
    print(name, f'{W:.1f}x120')
