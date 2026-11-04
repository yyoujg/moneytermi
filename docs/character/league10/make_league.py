"""리그 10단계: 장면 SVG(svg/scene-*.svg)를 120x120으로 배치.
league-{NN-slug}.svg / -locked.svg / -dark.svg"""
import re
from pathlib import Path
LOCK = {'#1F1A17': '#B0B8C1', '#8C7C6D': '#D1D6DB', '#F8EFDE': '#E5E8EB'}
TIERS = [('01-empty', '텅장'), ('02-ledger', '가계부'), ('03-saver', '짠테크'), ('04-savings', '적금'),
         ('05-routine', '갓생'), ('06-news', '정보통'), ('07-investor', '재테크'), ('08-holder', '존버'),
         ('09-rich', '자산가'), ('10-master', '돈방석')]
out = Path('league'); out.mkdir(exist_ok=True)
for k, title in TIERS:
    t = Path(f'svg/scene-{k}.svg').read_text().strip()
    W = float(re.search(r'viewBox="0 0 ([\d.]+) 120"', t).group(1))
    inner = re.search(r'<svg[^>]*>(.*)</svg>', t, re.S).group(1)
    s = min(106 / 120, 106 / W); w, h = W * s, 120 * s
    g = lambda b: f'<g transform="translate({(120 - w) / 2:.2f} {113 - h:.2f}) scale({s:.4f})">{b}</g>'
    sil = re.search(r'<path d="([^"]*)" fill="#1F1A17"/>', inner).group(1)
    sticker = f'<path d="{sil}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="{7 / s:.1f}" stroke-linejoin="round"/>'
    locked = inner
    for a, b in LOCK.items(): locked = locked.replace(a, b)
    for suf, body in [('', inner), ('-locked', locked), ('-dark', sticker + inner)]:
        (out / f'league-{k}{suf}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill-rule="evenodd"><title>{title}</title>{g(body)}</svg>\n')
