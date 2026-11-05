import io, sys, cairosvg
from PIL import Image, ImageDraw, ImageFont
from make_cards import TOPICS
suf, outp = sys.argv[1], sys.argv[2]
Fn = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 20)
cw, ch, cols = 320, 240, 5
img = Image.new('RGB', (cols*(cw+20)+20, 3*(ch+50)+20), 'white'); dr = ImageDraw.Draw(img)
for i,(slug,name) in enumerate(TOPICS.items()):
    png = cairosvg.svg2png(url=f'topic/topic-{slug}{suf}.svg', output_width=cw, output_height=ch)
    x, y = 20+(i%cols)*(cw+20), 20+(i//cols)*(ch+50)
    img.paste(Image.open(io.BytesIO(png)), (x, y)); dr.text((x+4, y+ch+8), name, font=Fn, fill='#191F28')
img.save(outp)
