import base64
from pathlib import Path
N = [('idle', '기본'), ('cheer', '만세'), ('explain', '설명'), ('shock', '놀람'), ('defeat', '좌절')]
uri = lambda p: 'data:image/svg+xml;base64,' + base64.b64encode(Path(p).read_bytes()).decode()
sil = lambda p: 'data:image/svg+xml;base64,' + base64.b64encode(Path(p).read_text().replace('#A9774F', '#000').replace('#FBEBD3', '#000').replace('#2B211C', '#000').encode()).decode()
def row(src, size, suf=''):
    return '<div class="row">' + ''.join(f'<figure><img src="{src(f"svg/otter-{k}{suf}.svg")}" width="{size}"><figcaption>{t}</figcaption></figure>' for k, t in N) + '</div>'
html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>수달 낙서 v5</title><style>
body{{margin:0;padding:24px 16px 40px;background:#F7F4EE;color:#2B211C;font-family:-apple-system,"Pretendard","Noto Sans KR",sans-serif}}
h1{{font-size:20px;margin:0 0 4px}} .sub{{font-size:13px;color:#6b625b;margin:0}} h2{{font-size:15px;margin:26px 0 10px}}
.row{{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end}} figure{{margin:0;text-align:center}} figcaption{{font-size:12px;margin-top:4px}}
.dark{{background:#16141C;color:#fff;padding:14px;border-radius:12px}}
</style></head><body><h1>수달 낙서 v5</h1><p class="sub">AI 기준 이미지를 벡터 추적 · 3색(선 #2B211C · 몸 #A9774F · 크림 #FBEBD3)</p>
<h2>5포즈 · 120px</h2>{row(uri, 120)}
<h2>32px · 위 일반본 / 아래 단순화본(선 굵게)</h2>{row(uri, 32)}{row(uri, 32, '-small')}
<h2>실루엣</h2>{row(sil, 72)}
<h2>다크 바탕 · 흰 외곽선(path)</h2><div class="dark">{row(uri, 88, '-dark')}</div>
<h2>기준 AI 이미지</h2><img src="data:image/png;base64,{base64.b64encode(Path('ref.png').read_bytes()).decode()}" style="width:100%;max-width:600px">
</body></html>'''
Path('preview.html').write_text(html)
