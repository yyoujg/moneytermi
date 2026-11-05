"""수달 v5 SVG(svg/otter-*.svg)에서 프로필 아바타 SVG를 만든다. 새로 그리지 않고 프레이밍만 바꾼다.

잘림 방지 방식:
  포즈마다 '턱선 높이(CUT)' 위에 있는 모든 그림(머리·귀·팔·손가락·효과선)을 감싸는
  최소 원을 계산하고, 그 원을 아바타 원으로 쓴다. → 턱선 위는 절대 잘리지 않고,
  원 아래쪽에서 몸통만 자연스럽게 잘린다(흉상).
  좌절(엎드린 포즈)은 CUT=120으로 몸 전체를 원 안에 넣는다.

출력(avatar/):
  avatar-{표정}-circle.svg  원형 클립 + 배경색 (바로 이미지로 사용)
  avatar-{표정}.svg         투명 배경, 같은 원에 맞춘 정사각 viewBox (앱에서 원형 마스크)
  avatar-{표정}-small.svg   40px 이하용 선 굵은 버전, 같은 프레이밍
  avatar-{표정}-dark.svg    다크 배경용 흰 외곽선 버전 (원을 외곽선 두께만큼 키움)
"""
import io, re
import cairosvg, cv2, numpy as np
from PIL import Image
from pathlib import Path

CUT = {'idle': 46, 'cheer': 46, 'explain': 46, 'shock': 62, 'defeat': 120}  # viewBox(120) 기준 턱선 y
MARGIN = 1.06          # 원 여백
DARK_PAD = 3.5         # 다크본 흰 외곽선 두께만큼 원 확장 (viewBox 단위)
R_MIN = 34.5         # 서 있는 포즈들의 얼굴 크기를 맞추기 위한 최소 반지름
BG = '#EFF5E9'         # primary-tint (세이지)
R = 4                  # 계산용 래스터 배율 (120 → 480px)

src, out = Path('svg'), Path('avatar'); out.mkdir(exist_ok=True)

def circle_for(svg_text, cut):
    png = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=120 * R, output_height=120 * R)
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))[:, :, 3]
    ys, xs = np.where(a[: int(cut * R)] > 10)
    (cx, cy), r = cv2.minEnclosingCircle(np.stack([xs, ys], 1).astype(np.float32))
    return cx / R, cy / R, r / R * MARGIN

def inner(t):
    return re.search(r'<svg[^>]*>(.*)</svg>', t, re.S).group(1)

def write(name, body, cx, cy, r, bg=None):
    x, y, s = cx - r, cy - r, 2 * r
    vb = f'{x:.1f} {y:.1f} {s:.1f} {s:.1f}'
    fill = f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{bg}"/>' if bg else ''
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill-rule="evenodd">'
           f'<defs><clipPath id="c"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}"/></clipPath></defs>'
           f'<g clip-path="url(#c)">{fill}{body}</g></svg>\n')
    (out / name).write_text(svg)

for k, cut in CUT.items():
    normal = (src / f'otter-{k}.svg').read_text()
    cx, cy, r = circle_for(normal, cut)
    r = max(r, R_MIN)   # 원을 키우기만 하므로 잘림은 생기지 않음
    write(f'avatar-{k}-circle.svg', inner(normal), cx, cy, r, BG)
    write(f'avatar-{k}.svg', inner(normal), cx, cy, r)
    write(f'avatar-{k}-small.svg', inner((src / f'otter-{k}-small.svg').read_text()), cx, cy, r)
    write(f'avatar-{k}-dark.svg', inner((src / f'otter-{k}-dark.svg').read_text()), cx, cy, r + DARK_PAD)
    print(f'{k}: center=({cx:.1f},{cy:.1f}) r={r:.1f}')
