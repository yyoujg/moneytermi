"""장면 SVG를 4:3 가로 주제 카드(viewBox 0 0 240 180)에 배치한다.
topic-{slug}.svg (세이지 배경) / topic-{slug}-clear.svg (투명)"""
import re
from pathlib import Path
BG, GROUND = '#EFF5E9', '#DCE8D1'
TOPICS = {'basics':'경제 기초 개념','household':'가계·소비·부동산','inflation':'물가·인플레이션','growth':'경기·성장·국민소득',
 'labor':'고용·노동·분배','monetary':'금리·통화정책·중앙은행','stocks-bonds':'주식·채권시장','investment':'파생상품·펀드·투자',
 'fx':'외환·환율','fiscal':'재정·조세·사회보장','trade':'국제수지·무역·통상','global':'국제기구·세계경제',
 'stability':'금융안정·건전성 규제','payments':'지급결제·화폐','corporate':'기업·산업·회계'}
out = Path('topic'); out.mkdir(exist_ok=True)
CW, CH = 240, 180
H, MAXW, BOTTOM = 122, 210, 172
for slug, name in TOPICS.items():
    t = Path(f'svg/scene-{slug}.svg').read_text().strip()
    W = float(re.search(r'viewBox="0 0 ([\d.]+) 120"', t).group(1))
    s = min(H / 120, MAXW / W); w, h = W * s, 120 * s
    x, y = (CW - w) / 2, BOTTOM - h
    inner = t.replace('<svg ', f'<svg x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" ', 1)
    ground = f'<ellipse cx="{CW/2}" cy="{BOTTOM-3}" rx="{min(w*0.48,72):.1f}" ry="5" fill="{GROUND}"/>'
    for suf, bg in [('', f'<rect width="{CW}" height="{CH}" fill="{BG}"/>'), ('-clear', '')]:
        (out / f'topic-{slug}{suf}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CW} {CH}"><title>{name}</title>{bg}{ground}{inner}</svg>\n')
