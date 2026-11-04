"""머니터미 스플래시 (375x812, 라이트 모드). 글자는 Pretendard를 path로 변환.
splash.svg      : 세이지 틴트 배경
splash-white.svg: 흰 배경"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import re

W, H = 375, 812
LINE, WHITE, INK, SUB, TINT, GROUND, STRONG = '#1F1A17', '#FFFFFF', '#191F28', '#4E5968', '#EFF5E9', '#DCE8D1', '#4F6B3A'

def font(p):
    f = TTFont(p); return f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm
BOLD = font('Pretendard-Bold.ttf'); MED = font('Pretendard-Medium.ttf')
def tw(s, size, fnt, track=0):
    gs, cm, upm = fnt; return sum(gs[cm[ord(c)]].width for c in s) * size / upm + track * (len(s) - 1)
def tp(s, size, fnt, cx, base, fill, track=0):
    gs, cm, upm = fnt; k = size / upm; x = cx - tw(s, size, fnt, track) / 2; pen = SVGPathPen(gs)
    for c in s:
        g = cm[ord(c)]; gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base))); x += gs[g].width * k + track
    return f'<path d="{pen.getCommands()}" fill="{fill}"/>'

otter = Path('../otter-v5/svg/otter-cheer.svg').read_text().strip()
OS = 200; ox, oy = (W - OS) / 2, 250
otter = otter.replace('<svg ', f'<svg x="{ox}" y="{oy}" width="{OS}" height="{OS}" ', 1)

# 말풍선
msg = '오늘의 경제 단어, 같이 볼까?'; FS = 15
bw, bh = tw(msg, FS, BOLD, -0.3) + 32, 40; bx, by = (W - bw) / 2, 190
tx = W / 2 + 18
bubble = (f'<path d="M{tx-7} {by+bh-1} L{tx+4} {by+bh+14} L{tx+9} {by+bh-1}Z" fill="{WHITE}" stroke="{LINE}" stroke-width="2.2" stroke-linejoin="round"/>'
          f'<rect x="{bx:.1f}" y="{by}" width="{bw:.1f}" height="{bh}" rx="{bh/2}" fill="{WHITE}" stroke="{LINE}" stroke-width="2.2"/>'
          f'<rect x="{tx-6}" y="{by+bh-4}" width="14" height="5" fill="{WHITE}"/>'
          + tp(msg, FS, BOLD, W / 2, by + bh / 2 + FS * 0.36, LINE, -0.3))

ground = f'<ellipse cx="{W/2}" cy="{oy+OS-8}" rx="70" ry="9" fill="{{g}}"/>'
word = tp('머니터미', 34, BOLD, W / 2, 530, INK, -0.8)
tag = tp('하루 한 단어로 쌓는 경제 감각', 16, MED, W / 2, 562, SUB, -0.3)
foot = tp('달리와 함께', 13, MED, W / 2, 760, STRONG, -0.2)

for name, bg, g in [('splash', TINT, GROUND), ('splash-white', WHITE, TINT)]:
    Path(f'{name}.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><title>머니터미</title>'
        f'<rect width="{W}" height="{H}" fill="{bg}"/>{ground.format(g=g)}{otter}{bubble}{word}{tag}{foot}</svg>\n')
