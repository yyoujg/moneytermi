"""머니터미 로고. 달리(otter v5 explain: 손가락 들고 '알려줄게' 포즈, 대안 cheer) 상반신이 아래에서 올라온 앱 아이콘 + 워드마크 조합.
글자는 Pretendard Bold를 path로 변환."""
import re, io
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import cairosvg

SAGE, TINT, INK, WHITE = '#A8C68F', '#EFF5E9', '#191F28', '#FFFFFF'
f = TTFont('Pretendard-Bold.ttf'); GS, CM, UPM = f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm
def tp(s, size, x, base, fill, track=0):
    k = size / UPM; pen = SVGPathPen(GS); w = 0
    for c in s:
        g = CM[ord(c)]; GS[g].draw(TransformPen(pen, (k, 0, 0, -k, x + w, base))); w += GS[g].width * k + track
    return f'<path d="{pen.getCommands()}" fill="{fill}"/>', w - track

POSE = {'explain': (1.2, 58, 18), 'cheer': (1.05, 56, 10)}   # 배율, 머리 중심 x, 머리 위 여백
CUR = 'explain'
def otter(variant=''):
    return re.search(r'<svg[^>]*>(.*)</svg>', Path(f'../otter-v5/svg/otter-{CUR}{variant}.svg').read_text(), re.S).group(1)

# 아이콘 내부(100x100): 머리 폭 ≈ 56% , 머리 위 여백 ≈ 18%, 몸은 아래 가장자리에서 잘림
def icon_body(bg, variant=''):
    S, cx, top = POSE[CUR]; TX, TY = 50 - cx * S, top - 6 * S
    return (f'<rect width="100" height="100" fill="{bg}"/>'
            f'<g transform="translate({TX:.2f} {TY:.2f}) scale({S})">{otter(variant)}</g>')

def icon(name, bg, variant='', rounded=False):
    clip = '<clipPath id="c"><rect width="100" height="100" rx="22.5"/></clipPath>' if rounded else '<clipPath id="c"><rect width="100" height="100"/></clipPath>'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill-rule="evenodd"><title>머니터미</title>'
           f'<defs>{clip}</defs><g clip-path="url(#c)">{icon_body(bg, variant)}</g></svg>\n')
    Path(name).write_text(svg); return svg

out = {}
out['logo-icon.svg'] = icon('logo-icon.svg', SAGE)                       # 업로드용 정사각(모서리 처리는 플랫폼에 맡김)
out['logo-icon-rounded.svg'] = icon('logo-icon-rounded.svg', SAGE, rounded=True)
out['logo-icon-small.svg'] = icon('logo-icon-small.svg', SAGE, '-small')  # 48px 이하: 선 굵은 버전
out['logo-icon-tint.svg'] = icon('logo-icon-tint.svg', TINT)

# 가로 조합: 아이콘(둥근) + 워드마크
def lockup(name, ink, bg=None):
    H = 100; txt, tw = tp('머니터미', 52, 0, 0, ink, -1.2)
    gap = 22; W = 100 + gap + tw + 4
    txt, _ = tp('머니터미', 52, 100 + gap, 50 + 52 * 0.36, ink, -1.2)
    b = f'<rect width="{W:.0f}" height="{H}" fill="{bg}"/>' if bg else ''
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H}" fill-rule="evenodd"><title>머니터미</title>{b}'
           f'<defs><clipPath id="c"><rect width="100" height="100" rx="22.5"/></clipPath></defs>'
           f'<g clip-path="url(#c)">{icon_body(SAGE)}</g>{txt}</svg>\n')
    Path(name).write_text(svg)
lockup('logo-lockup.svg', INK)
lockup('logo-lockup-white.svg', WHITE)       # 어두운 배경(외부 홍보물)용 — 앱 안은 라이트 모드 전용

# 워드마크 단독
txt, tw = tp('머니터미', 52, 2, 52 * 0.88, INK, -1.2)
Path('logo-wordmark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {tw+4:.0f} 60"><title>머니터미</title>{txt}</svg>\n')

# 대안: 만세 포즈 아이콘
CUR = 'cheer'
icon('alt-cheer/logo-icon.svg', SAGE); icon('alt-cheer/logo-icon-rounded.svg', SAGE, rounded=True); lockup('alt-cheer/logo-lockup.svg', INK)
CUR = 'explain'
# PNG 내보내기
Path('png').mkdir(exist_ok=True)
for px in (1024, 600, 512, 192):
    cairosvg.svg2png(url='logo-icon.svg', write_to=f'png/logo-icon-{px}.png', output_width=px, output_height=px)
cairosvg.svg2png(url='logo-icon-small.svg', write_to='png/logo-icon-small-96.png', output_width=96, output_height=96)
cairosvg.svg2png(url='logo-lockup.svg', write_to='png/logo-lockup.png', output_height=200)
