"""리그 티어 5종: 수달 상호작용 장면을 120x120 정사각으로 배치.
league-{tier}.svg / -locked.svg(회색) / -dark.svg(흰 스티커 외곽선, 다크 배경용)"""
import re
from pathlib import Path
COL = {'#1F1A17': '#B0B8C1', '#8C7C6D': '#D1D6DB', '#F8EFDE': '#E5E8EB'}
NAMES = {'tier1-moneybeginner': '현실 텅장', 'tier2-saver': '짠테크러', 'tier3-routine': '갓생러',
         'tier4-investor': '재테크러', 'tier5-master': '경제고수'}
out = Path('league'); out.mkdir(exist_ok=True)
for k, title in NAMES.items():
    t = Path(f'svg/scene-{k}.svg').read_text().strip()
    W = float(re.search(r'viewBox="0 0 ([\d.]+) 120"', t).group(1))
    inner = re.search(r'<svg[^>]*>(.*)</svg>', t, re.S).group(1)
    s = min(106 / 120, 106 / W); w, h = W * s, 120 * s
    g = lambda body: f'<g transform="translate({(120 - w) / 2:.2f} {113 - h:.2f}) scale({s:.4f})">{body}</g>'
    sil = re.search(r'<path d="([^"]*)" fill="#1F1A17"/>', inner).group(1)
    sticker = f'<path d="{sil}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="{7 / s:.1f}" stroke-linejoin="round"/>'
    locked = inner
    for a, b in COL.items(): locked = locked.replace(a, b)
    for suf, body in [('', inner), ('-locked', locked), ('-dark', sticker + inner)]:
        (out / f'league-{k}{suf}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill-rule="evenodd"><title>{title}</title>{g(body)}</svg>\n')
