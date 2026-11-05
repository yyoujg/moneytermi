"""장면별 표정 바꾸기: 기준 PNG에서 눈·입을 지우고(inpaint) 새 표정을 그린 뒤 ref-scenes-*-expr.png로 저장.
좌표: faces.py 크롭(머리 중심 HEADS ±65px) 기준 L눈, R눈, 코, 입."""
import cv2, numpy as np
from faces import HEADS
BLK, CRM, BODY = (8, 9, 10), (222, 236, 244), (106, 118, 134)
F = {  # slug: (L, R, nose, mouth, eyes, mouth_style, extras, 표정명)
 'basics':      ((61,60),(104,54),(86,63),(85,78),'dot','flat',['sweat'],'조마조마'),
 'corporate':   ((57,65),(106,74),(82,78),(82,95),'dot','keep',['glasses'],'꼼꼼'),
 'investment':  ((59,56),(103,64),(79,69),(79,84),'sparkle','keep',['blush'],'설렘'),
 'stocks-bonds':((53,64),(99,55),(80,67),(80,82),'xx','open',[],'신남'),
 'fiscal':      ((36,60),(82,65),(56,69),(55,85),'relax','u',[],'안심'),
 'household':   ((37,57),(79,65),(58,67),(55,80),'wink','open',[],'반가움'),
 'inflation':   ((42,72),(94,77),(72,81),(67,100),'ring','keep',[],'경악'),
 'growth':      (None,(77,64),(117,53),(112,72),'chevron','keep',[],'의욕'),
 'labor':       ((47,70),(93,66),(78,75),(77,88),'line','o',[],'졸림'),
 'monetary':    ((42,68),(91,68),(67,76),(67,88),'happy','keep',['blush'],'뿌듯'),
 'fx':          ((32,63),(98,63),(63,72),(65,93),'uneven','wavy',[],'헷갈림'),
 'trade':       ((47,68),(101,56),(78,68),(78,87),'dot','bigopen',[],'활짝'),
 'global':      ((33,61),(96,77),(62,75),(57,95),'heart','keep',[],'애정'),
 'stability':   ((33,63),(98,63),(67,75),(67,92),'brow','smirk',[],'결의'),
 'payments':    ((39,72),(99,58),(72,73),(73,88),'dot','tongue',[],'메롱'),
}
P = lambda p: (int(round(p[0])), int(round(p[1])))

def ell(img, c, ax, a0, a1, col, t):
    cv2.ellipse(img, P(c), (int(ax[0]), int(ax[1])), 0, a0, a1, col, t, cv2.LINE_AA)

def eye(img, e, kind, u, side):
    x, y = e; t = max(2, int(3.4 * u))
    if kind == 'dot': cv2.circle(img, P(e), int(4.6 * u), BLK, -1, cv2.LINE_AA)
    elif kind == 'sparkle':
        cv2.circle(img, P(e), int(6 * u), BLK, -1, cv2.LINE_AA); cv2.circle(img, P((x - 2 * u, y - 2 * u)), max(2, int(2.2 * u)), (255, 255, 255), -1)
    elif kind == 'ring':
        cv2.circle(img, P(e), int(9 * u), CRM, -1, cv2.LINE_AA); cv2.circle(img, P(e), int(9 * u), BLK, t, cv2.LINE_AA)
        cv2.circle(img, P(e), int(3 * u), BLK, -1, cv2.LINE_AA)
    elif kind == 'happy': ell(img, (x, y + 3 * u), (6 * u, 5 * u), 180, 360, BLK, t)
    elif kind == 'relax': ell(img, (x, y - 3 * u), (6 * u, 4 * u), 0, 180, BLK, t)
    elif kind == 'line': cv2.line(img, P((x - 6 * u, y)), P((x + 6 * u, y)), BLK, t, cv2.LINE_AA)
    elif kind == 'xx':
        s = 1 if side == 'L' else -1
        pts = np.array([P((x - 5 * u * s, y - 5 * u)), P((x + 4 * u * s, y)), P((x - 5 * u * s, y + 5 * u))])
        cv2.polylines(img, [pts], False, BLK, t, cv2.LINE_AA)
    elif kind == 'chevron':
        pts = np.array([P((x - 5 * u, y - 5 * u)), P((x + 4 * u, y)), P((x - 5 * u, y + 5 * u))])
        cv2.polylines(img, [pts], False, BLK, t, cv2.LINE_AA)
    elif kind == 'heart':
        r = 3.6 * u
        cv2.circle(img, P((x - r * 0.9, y - r * 0.4)), int(r), BLK, -1, cv2.LINE_AA)
        cv2.circle(img, P((x + r * 0.9, y - r * 0.4)), int(r), BLK, -1, cv2.LINE_AA)
        cv2.fillPoly(img, [np.array([P((x - 2 * r * 0.95, y)), P((x + 2 * r * 0.95, y)), P((x, y + 2.3 * r))])], BLK, cv2.LINE_AA)

def draw(img, f, u):
    L, R, N, M, ek, mk, ex, _ = f
    t = max(2, int(3.4 * u))
    eyes = [(L, 'L'), (R, 'R')] if L else [(R, 'R')]
    for e, sd in eyes:
        if ek == 'wink': eye(img, e, 'dot' if sd == 'L' else 'happy', u, sd)
        elif ek == 'uneven':
            eye(img, e, 'dot', u * (1.15 if sd == 'L' else 0.8), sd)
        elif ek == 'brow':
            eye(img, e, 'dot', u, sd); s = 1 if sd == 'L' else -1
            cv2.line(img, P((e[0] - 6 * u * s, e[1] - 12 * u)), P((e[0] + 5 * u * s, e[1] - 8 * u)), BLK, t, cv2.LINE_AA)
        else: eye(img, e, ek, u, sd)
    if ek == 'uneven':  # 한쪽 눈썹만 올림
        cv2.line(img, P((R[0] - 5 * u, R[1] - 10 * u)), P((R[0] + 6 * u, R[1] - 13 * u)), BLK, t, cv2.LINE_AA)
    x, y = M
    if mk == 'flat': cv2.line(img, P((x - 7 * u, y)), P((x + 7 * u, y)), BLK, t, cv2.LINE_AA)
    elif mk == 'open':
        ell(img, (x, y - 4 * u), (8 * u, 8 * u), 0, 180, BLK, -1)
    elif mk == 'bigopen':
        ell(img, (x, y - 5 * u), (11 * u, 11 * u), 0, 180, BLK, -1)
        ell(img, (x, y + 3 * u), (5 * u, 2.6 * u), 180, 360, BODY, -1)
    elif mk == 'u': ell(img, (x, y - 4 * u), (6 * u, 5 * u), 0, 180, BLK, t)
    elif mk == 'o': cv2.ellipse(img, P((x, y + 3 * u)), (int(3.5 * u), int(4.5 * u)), 0, 0, 360, BLK, -1, cv2.LINE_AA)
    elif mk == 'wavy':
        xs = np.linspace(-9, 9, 30) * u
        pts = np.array([P((x + a, y + 2.2 * u * np.sin(a / u / 9 * 2 * np.pi))) for a in xs])
        cv2.polylines(img, [pts], False, BLK, t, cv2.LINE_AA)
    elif mk == 'smirk':
        ell(img, (x + 3 * u, y - 4 * u), (7 * u, 4 * u), 10, 160, BLK, t)
    elif mk == 'tongue':
        c = (x + 3 * u, y + 5 * u)
        cv2.ellipse(img, P(c), (int(4.5 * u), int(5.5 * u)), 0, 0, 180, BODY, -1, cv2.LINE_AA)
        cv2.ellipse(img, P(c), (int(4.5 * u), int(5.5 * u)), 0, 0, 180, BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
        cv2.line(img, P((c[0] - 4.5 * u, c[1])), P((c[0] + 4.5 * u, c[1])), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
    if 'glasses' in ex:
        for e in (L, R): cv2.circle(img, P(e), int(9.5 * u), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
        a, b = np.array(L, float), np.array(R, float); d = (b - a) / np.linalg.norm(b - a)
        cv2.line(img, P(a + d * 9.5 * u), P(b - d * 9.5 * u), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
    if 'blush' in ex:
        for e in (L, R):
            for k in range(3):
                bx, by = e[0] - 5 * u + k * 5 * u, e[1] + 10 * u
                cv2.line(img, P((bx, by + 2.5 * u)), P((bx + 2.5 * u, by - 2.5 * u)), BLK, max(2, int(2.2 * u)), cv2.LINE_AA)
    if 'sweat' in ex:
        sx, sy = R[0] + 30 * u, R[1] + 2 * u
        u = u * 1.3
        pts = np.array([P((sx, sy - 8 * u)), P((sx - 4.5 * u, sy + 1 * u)), P((sx, sy + 5 * u)), P((sx + 4.5 * u, sy + 1 * u))])
        cv2.circle(img, P((sx, sy + 1 * u)), int(4.5 * u), CRM, -1, cv2.LINE_AA)
        cv2.fillPoly(img, [pts], CRM, cv2.LINE_AA)
        cv2.circle(img, P((sx, sy + 1 * u)), int(4.5 * u), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
        cv2.line(img, P((sx - 3.3 * u, sy - 2 * u)), P((sx, sy - 8 * u)), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)
        cv2.line(img, P((sx + 3.3 * u, sy - 2 * u)), P((sx, sy - 8 * u)), BLK, max(2, int(2.6 * u)), cv2.LINE_AA)

for f, d in HEADS.items():
    img = cv2.imread(f'ref-scenes-{f}.png')
    for slug, (cx, cy) in d.items():
        L, R, N, M, ek, mk, ex, _ = F[slug]
        o = np.array([cx - 65, cy - 65])
        g = lambda p: None if p is None else tuple(np.array(p) + o)
        fd = (g(L), g(R), g(N), g(M), ek, mk, ex, _)
        u = (np.linalg.norm(np.subtract(R, L)) / 46) if L else 1.0
        u *= 1.0
        blk = (img.astype(int).sum(2) < 200).astype(np.uint8)
        mask = np.zeros(blk.shape, np.uint8)
        erase_eyes = ek not in ('keep',)
        if erase_eyes:
            for e in (fd[0], fd[1]):
                if e is not None: cv2.circle(mask, P(e), int(8 * u), 1, -1)
        if mk not in ('keep', 'tongue') and not (slug == 'growth'):
            cv2.ellipse(mask, P(fd[3]), (int(18 * u), int(8 * u)), 0, 0, 360, 1, -1)
        mask = cv2.dilate(mask & blk, np.ones((5, 5), np.uint8))
        img = cv2.inpaint(img, mask * 255, 6, cv2.INPAINT_TELEA)
        draw(img, fd, u)
    cv2.imwrite(f'ref-scenes-{f}-expr.png', img)
