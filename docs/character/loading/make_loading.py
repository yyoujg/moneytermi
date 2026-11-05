"""로딩 애니메이션 '달리의 용어 공부' — 수달은 otter-v5 원본 SVG 포즈만 사용(새로 그리지 않음).
4.2초 루프: [기본] 용어 카드를 보며 갸웃(?), 눈 깜빡 → [설명] 손가락 척 + 전구 → [만세] 카드에 체크, 반짝
포즈 사이 위치는 발 중심으로 맞춤. 새로 그린 것은 카드·물음표·전구·체크·반짝이(v5 3색, v5 선 굵기)."""
import re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
LINE, BODY, CREAM = '#1F1A17', '#8C7C6D', '#F8EFDE'
SW = 1.4
def v5(k): return re.search(r'<svg[^>]*>(.*)</svg>', Path(f'../otter-v5/svg/otter-{k}.svg').read_text(), re.S).group(1)
def L(d, w=SW): return f'<path d="{d}" fill="none" stroke="{LINE}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def P(d, fill=CREAM, w=SW): return f'<path d="{d}" fill="{fill}" stroke="{LINE}" stroke-width="{w}" stroke-linejoin="round"/>'
FEET = {'idle': 52.9, 'explain': 54.75, 'cheer': 57.9}
OX = -6                                   # 수달 전체를 왼쪽으로(오른쪽에 카드 자리)
def pose(k, extra=''):
    return f'<g transform="translate({OX + 52.9 - FEET[k]:.2f} 0)">{v5(k)}{extra}</g>'

f = TTFont('Pretendard-Bold.ttf'); GS, CM, UPM = f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm
def text(s, size, cx, base):
    k = size / UPM; w = sum(GS[CM[ord(c)]].width for c in s) * k; x = cx - w / 2; pen = SVGPathPen(GS)
    for c in s:
        g = CM[ord(c)]; GS[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base))); x += GS[g].width * k
    return f'<path d="{pen.getCommands()}" fill="{LINE}"/>'

# 용어 카드(오른쪽 위에 떠 있음): 단어 '금리' + 밑줄 두 줄
card = (f'<g class="card">' + P('M90 16 h28 a3 3 0 0 1 3 3 v20 a3 3 0 0 1 -3 3 h-28 a3 3 0 0 1 -3 -3 v-20 a3 3 0 0 1 3 -3Z')
        + text('금리', 7.5, 104, 26.5) + L('M93 32 L115 32', 1) + L('M93 36 L109 36', 1) + '</g>')
q = f'<g class="q">' + text('?', 14, 76, 8) + '</g>'
blink = (f'<g class="blink"><g transform="translate({OX} 0)"><circle cx="45.4" cy="22.4" r="2.2" fill="{BODY}"/><circle cx="63" cy="21.2" r="2.2" fill="{BODY}"/>'
         + L('M43.5 22.9 L47.3 22.9') + L('M61.1 21.7 L64.9 21.7') + '</g></g>')
bx, by = 50 + OX, -14.5
bulb = (f'<g class="bulb">' + P(f'M{bx} {by} c-4.5 0 -7 3.5 -7 6.7 c0 2.8 1.8 4.2 2.8 5.8 v1.6 h8.4 v-1.6 c1 -1.6 2.8 -3 2.8 -5.8 c0 -3.2 -2.5 -6.7 -7 -6.7Z')
        + P(f'M{bx-3.7} {by+14.1} h7.4 l-0.5 2.8 h-6.4Z', BODY) + L(f'M{bx-2.5} {by+5} q1 -1.5 2.5 -1.7', 1)
        + L(f'M{bx} {by-4.3} v-1.6') + L(f'M{bx-9.5} {by-.5} l1.3 1.1') + L(f'M{bx+9.5} {by-.5} l-1.3 1.1') + L(f'M{bx-11.2} {by+7} h1.6') + L(f'M{bx+11.2} {by+7} h-1.6') + '</g>')
check = f'<g class="check">' + L('M108 30 L112 34.5 L120 23', 2.4) + '</g>'
spark = lambda x, y, s: P(f'M{x} {y-s} Q{x+s*.25} {y-s*.25} {x+s} {y} Q{x+s*.25} {y+s*.25} {x} {y+s} Q{x-s*.25} {y+s*.25} {x-s} {y} Q{x-s*.25} {y-s*.25} {x} {y-s}Z', CREAM, 1.1)
sparks = f'<g class="spark">{spark(16, 22, 4)}{spark(98, 54, 3.2)}</g>'

T = 4.2
def vis(name, a, b):     # a~b초 동안 보임
    return (f'.{name}{{visibility:hidden;animation:{name}v {T}s steps(1,end) infinite}}'
            f'@keyframes {name}v{{0%{{visibility:hidden}}{a / T * 100:.2f}%{{visibility:visible}}{b / T * 100:.2f}%{{visibility:hidden}}100%{{visibility:hidden}}}}')
css = (vis('p1', 0, 1.5) + vis('p2', 1.5, 2.9) + vis('p3', 2.9, 4.2) + vis('q', 0.2, 1.5) + vis('blink', 0.85, 1.0)
       + vis('bulb', 1.6, 2.9) + vis('check', 3.0, 4.2) + vis('spark', 3.0, 4.2)
       + '.bulb{transform-box:view-box;transform-origin:42px 8px}'
       + '.q,.bulb,.check{animation-name:var(--n)}'
       + f'.card{{animation:bob {T / 2}s ease-in-out infinite}}@keyframes bob{{50%{{transform:translateY(-1.2px)}}}}'
       + '@media (prefers-reduced-motion:reduce){.p1,.p2,.p3,.q,.blink,.bulb,.check,.spark,.card{animation:none}.p1,.q{visibility:visible}}')
css = css.replace('.q,.bulb,.check{animation-name:var(--n)}', '')
body = (card + f'<g class="p1">{pose("idle")}</g>' + q + blink + f'<g class="p2">{pose("explain")}</g>' + bulb
        + f'<g class="p3">{pose("cheer")}</g>' + check + sparks)
Path('otter-study.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 -23 122 139" fill-rule="evenodd"><title>로딩 중</title><style>{css}</style>{body}</svg>\n')
