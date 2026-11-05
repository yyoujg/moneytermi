"""4:3 가로 주제 카드 + 달리 혼잣말 말풍선. topic/topic-{slug}-bubble.svg (배경 포함), -bubble-clear.svg (투명)
말풍선 문구는 LINES에서 바꾸면 된다. 글자는 Pretendard Bold(OFL)를 path로 변환해 넣는다(기기 글꼴 무관)."""
import re, json, numpy as np
from pathlib import Path
from make_cards import TOPICS, BG, GROUND
from faces import HEADS
from expressions import F
LINE, WHITE = '#1F1A17', '#FFFFFF'
LINES = {
 'basics': '균형 잡기 어렵다…', 'household': '어서 와, 우리 집!', 'inflation': '물가 실화야…?',
 'growth': '한 칸씩 올라가자!', 'labor': '벌써 출근이라니…', 'monetary': '내 소중한 동전…',
 'stocks-bonds': '가즈아~!', 'investment': '무럭무럭 자라라', 'fx': '환율이 얼마더라?',
 'fiscal': '비 와도 든든해', 'trade': '수출 출발~!', 'global': '세계는 하나!',
 'stability': '위험은 막는다!', 'payments': '카드 있지롱~', 'corporate': '차변, 대변…',
}
meta = json.loads(Path('svg/meta.json').read_text())
FS = 11
SIDE = {'payments': 'left', 'inflation': 'left'}   # 소품을 가리지 않도록 방향 고정
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
FONT = TTFont('Pretendard-Bold.ttf'); GS = FONT.getGlyphSet(); CMAP = FONT.getBestCmap(); UPM = FONT['head'].unitsPerEm
def text_w(s):
    return sum(GS[CMAP[ord(c)]].width for c in s) * FS / UPM - 0.2 * (len(s) - 1)
def text_path(s, x0, base):   # 글자를 path로 변환(기기 글꼴과 무관하게 동일하게 보이도록), 자간 -0.2
    pen = SVGPathPen(GS); k = FS / UPM; x = x0
    for c in s:
        g = CMAP[ord(c)]
        GS[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base)))
        x += GS[g].width * k - 0.2
    return pen.getCommands()

def face(slug):
    for f, d in HEADS.items():
        if slug in d: cx, cy = d[slug]
    L, R = F[slug][0], F[slug][1]
    pts = [p for p in (L, R) if p]
    m = np.mean(pts, 0)
    return cx - 65 + m[0], cy - 65 + m[1]

CW, CH, BOTTOM = 240, 180, 172     # 4:3 가로 카드
for slug, name in TOPICS.items():
    t = Path(f'svg/scene-{slug}.svg').read_text().strip()
    W = float(re.search(r'viewBox="0 0 ([\d.]+) 120"', t).group(1))
    bx, by, h = meta[slug]; fx, fy = face(slug)
    sx, sy = (fx - bx) * 120 / h, (fy - by) * 120 / h          # scene 좌표의 얼굴 중심
    L, R = F[slug][0], F[slug][1]
    ed = (np.hypot(R[0] - L[0], R[1] - L[1]) if L else 44) * 120 / h   # scene 좌표 눈 간격
    s = min(122 / 120, 210 / W)
    w, hh = W * s, 120 * s
    x, y = (CW - w) / 2, BOTTOM - hh
    hx, hy = x + sx * s, y + sy * s
    head_top = hy - ed * s * 1.05
    text = LINES[slug]; bw, bh = text_w(text) + 22, 27
    # 말풍선: 장면 맨 위(소품 포함)보다 위, 얼굴 쪽으로 치우치되 카드 안
    byy = max(6, min(head_top, y + 2) - 13 - bh)
    cx = min(max(hx + (CW / 2 - hx) * 0.35, bw / 2 + 8), CW - bw / 2 - 8)
    bxx = cx - bw / 2
    tx = min(max(hx, bxx + 16), bxx + bw - 16)
    tip = (tx + (hx - tx) * 0.5, min(head_top - 3, byy + bh + 13))
    tail = (f'<path d="M{tx-5:.1f} {byy+bh-1:.1f} L{tip[0]:.1f} {tip[1]:.1f} L{tx+5:.1f} {byy+bh-1:.1f}Z" '
            f'fill="{WHITE}" stroke="{LINE}" stroke-width="1.8" stroke-linejoin="round"/>')
    bubble = (tail + f'<rect x="{bxx:.1f}" y="{byy:.1f}" width="{bw:.1f}" height="{bh}" rx="{bh/2}" fill="{WHITE}" stroke="{LINE}" stroke-width="1.8"/>'
              f'<rect x="{tx-4:.1f}" y="{byy+bh-3:.1f}" width="8" height="3.5" fill="{WHITE}"/>'
              f'<path d="{text_path(text, bxx + 11, byy + bh/2 + FS*0.36)}" fill="{LINE}"/>')
    inner = t.replace('<svg ', f'<svg x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{hh:.1f}" ', 1)
    ground = f'<ellipse cx="{CW/2}" cy="{BOTTOM-3}" rx="{min(w*0.48,90):.1f}" ry="6" fill="{GROUND}"/>'
    for suf, bg in [('', f'<rect width="{CW}" height="{CH}" fill="{BG}"/>'), ('-clear', '')]:
        Path(f'topic/topic-{slug}-bubble{suf}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CW} {CH}"><title>{name} — {text}</title>{bg}{ground}{inner}{bubble}</svg>\n')
