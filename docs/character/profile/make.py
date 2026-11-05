"""프로필 5종 — 수달 v5 원본 SVG 그대로. 표정이 v5에 없는 2종(방긋·졸림)은 v5 기본 얼굴에서 눈·입만 v5 선 굵기로 바꿔 그림.
프레이밍은 otter-v5/make_avatars.py와 동일(턱선 위 최소 외접원, 최소 반지름 고정)."""
import io, re
import cairosvg, cv2, numpy as np
from PIL import Image
from pathlib import Path
OT = Path('../otter-v5/svg'); SRC = Path('src'); OUT = Path('avatar'); OUT.mkdir(exist_ok=True)
LINE, BODY, CREAM, BG = '#1F1A17', '#8C7C6D', '#F8EFDE', '#EFF5E9'
SW = 1.35
def inner(p): return re.search(r'<svg[^>]*>(.*)</svg>', Path(p).read_text(), re.S).group(1)
def stroke(d): return f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round"/>'
COVER = (f'<circle cx="45.5" cy="22.5" r="2.1" fill="{BODY}"/><circle cx="63" cy="21.2" r="2.1" fill="{BODY}"/>'
         f'<ellipse cx="54.6" cy="29.5" rx="5" ry="1.6" fill="{CREAM}"/>')
FACES = {
  # 방긋: 눈웃음(∩) + 벌린 웃는 입
  'happy': stroke('M43.4 23.2 Q45.5 20.6 47.6 23.2') + stroke('M60.9 21.9 Q63 19.3 65.1 21.9')
           + f'<path d="M51.6 28.4 Q54.7 28.9 57.8 28.2 Q57.2 32.4 54.6 32.4 Q52.1 32.4 51.6 28.4Z" fill="{LINE}"/>',
  # 졸림: 일자 눈 + 작은 하품 입
  'sleepy': stroke('M43.6 22.9 L47.4 22.9') + stroke('M61.1 21.6 L64.9 21.6')
            + f'<ellipse cx="54.7" cy="30" rx="1.5" ry="1.9" fill="{LINE}"/>',
}
SET = [('basic', '기본', 'idle', None), ('happy', '방긋', 'idle', 'happy'), ('confident', '자신만만', 'explain', None),
       ('surprised', '깜짝', 'shock', None), ('sleepy', '졸림', 'idle', 'sleepy')]
CUT = {'idle': 46, 'explain': 46, 'shock': 62}
MARGIN, R_MIN, R = 1.06, 34.5, 4

def circle_for(svg_text, cut):
    png = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=120 * R, output_height=120 * R)
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))[:, :, 3]
    ys, xs = np.where(a[: int(cut * R)] > 10)
    (cx, cy), r = cv2.minEnclosingCircle(np.stack([xs, ys], 1).astype(np.float32))
    return cx / R, cy / R, max(r / R * MARGIN, R_MIN)

def write(name, title, body, cx, cy, r, bg=None, ring=False):
    vb = f'{cx - r:.1f} {cy - r:.1f} {2 * r:.1f} {2 * r:.1f}'
    fill = f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{bg}"/>' if bg else ''
    rg = f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r - 0.9:.1f}" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>' if ring else ''
    (OUT / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill-rule="evenodd"><title>{title}</title>'
                            f'<defs><clipPath id="c"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}"/></clipPath></defs>'
                            f'<g clip-path="url(#c)">{fill}{body}</g>{rg}</svg>\n')

for key, title, pose, face in SET:
    body = inner(OT / f'otter-{pose}.svg') + (COVER + FACES[face] if face else '')
    small = inner(OT / f'otter-{pose}-small.svg') + (COVER + FACES[face] if face else '')
    full = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill-rule="evenodd">{body}</svg>'
    (SRC / f'otter-{key}.svg').write_text(full + '\n')        # 전신(표정 반영) — 다른 곳에도 재사용 가능
    cx, cy, r = circle_for(full, CUT[pose])
    write(f'avatar-{key}-circle.svg', title, body, cx, cy, r, BG)
    write(f'avatar-{key}.svg', title, body, cx, cy, r)
    write(f'avatar-{key}-small.svg', title, small, cx, cy, r, BG)
    write(f'avatar-{key}-dark.svg', title, body, cx, cy, r, BG, ring=True)
    print(key, f'r={r:.1f}')
