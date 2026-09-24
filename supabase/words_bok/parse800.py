"""한국은행 경제금융용어 800선 PDF -> words 본문 재추출 (2026-09-24 재파싱)

첫 추출은 페이지마다 오른쪽 위에 찍히는 러닝헤더(인접 용어명)를 본문 줄로 취급해
103개 항목에 옆 용어가 끼어들고, 8개 이상은 본문이 통째로 옆 용어 것으로 밀렸다.
이 스크립트는 들여쓰기로 러닝헤더를 걸러내고(표제어 <= 12칸, 러닝헤더 >= 31칸),
줄 이음은 첫 추출의 정상 항목에서 학습한 문자별 공백 확률(join_table.json)로 결정한다.

사용: python3 parse800.py [PDF경로]
출력: NN_words_fix_N.sql (기준 = 소스 SQL + 이미 만든 fix 파일. 실질적으로 다른 행만 UPDATE, 70행씩 분할. NN은 다음 번호)
       다시 돌릴 때마다 이전 fix 파일은 '적용된 것'으로 간주하므로, 만든 파일은 반드시 적용한 뒤 커밋할 것.
"""
import glob, json, pathlib, re, subprocess, sys, tempfile

HERE = pathlib.Path(__file__).parent
PDF = sys.argv[1] if len(sys.argv) > 1 else '/Users/dev/경제용어원천자료/2026_경제금융용어 800선.pdf'
JAMO = set('ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ')
JOIN = json.load(open(HERE / 'join_table.json'))
TERMS: set = set()   # main()에서 채움 (찾아보기 + 현재 DB 단어명)
norm = lambda s: re.sub(r'\s+', '', s)
base = lambda w: re.split(r'[(/;]', w)[0].strip()


def pdf_lines():
    out = pathlib.Path(tempfile.gettempdir()) / 'bok800_layout.txt'
    if not out.exists():
        subprocess.run(['pdftotext', '-layout', PDF, str(out)], check=True)
    return out.read_text().split('\n')


def parse_index(lines, body_start):
    """앞쪽 찾아보기: '용어·····쪽' 이 한 줄에 2단으로 온다."""
    terms = []
    for l in lines[:body_start]:
        for m in re.finditer(r'(\S[^·]*?(?:·[^· ][^·]*?)*)\s*·[· ]{2,}\s*(\d{1,3})', l):
            t = re.sub(r'^(찾아보기\s*)?[ㄱ-ㅎ]?\s+', '', ' ' + m.group(1)).strip(' ·')
            if t and t not in terms:
                terms.append(t)
    return terms


def indent(l):
    r = l.rstrip()
    return len(r) - len(r.lstrip())


def is_noise(l):
    s = l.strip()
    if not s or re.fullmatch(r'\d{1,3}', s) or '경제금융용어 800선' in s or s in JAMO or s.startswith('찾아보기'):
        return True
    return indent(l) > 30 and norm(s) in TERMS   # 러닝헤더(페이지 오른쪽 위 인접 용어명). 들여쓴 수식 줄은 남긴다


def join_lines(parts):
    """줄 끝/다음 줄 첫 글자의 공백 확률 평균 >= 0.5면 공백, 아니면 붙인다."""
    if not parts:
        return ''
    out = parts[0]
    for nxt in parts[1:]:
        a, b = out[-1], nxt[0]
        ps = [p for p in (JOIN['last'].get(a), JOIN['first'].get(b)) if p is not None]
        if ps:
            space = sum(ps) / len(ps) >= 0.5
        else:
            space = bool(re.match(r'[.,)\]:;0-9A-Za-z]', a)) or not re.match(r'[가-힣]', b)
        out += (' ' if space else '') + nxt
    return re.sub(r'\s+', ' ', out).strip()


def first_sentence(text, limit=110):
    s = re.split(r'(?<=다\.)\s', text)[0].strip()
    if len(s) > limit:
        cut = s.rfind(' ', 0, limit)
        s = s[:cut if cut > 40 else limit]
    return s


def main():
    lines = pdf_lines()
    body_start = next(i for i, l in enumerate(lines) if l.strip() == '가계부실위험지수(HDRI)' and indent(l) <= 12)

    # 현재 SQL (비교 대상 + 두 줄에 걸친 찾아보기 항목 보완용 단어명)
    cur = {}
    pat = re.compile(r"^\((\d+),'((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)',(?:ARRAY\[(.*?)\]::text\[\]|'\{\}'::text\[\])\)", re.M)
    un = lambda x: x.replace("''", "'")
    for f in sorted(glob.glob(str(HERE / '*_words_*.sql'))):
        for m in pat.finditer(pathlib.Path(f).read_text()):
            cur[un(m.group(2))] = dict(id=int(m.group(1)), meaning=un(m.group(3)), detailed=un(m.group(4)),
                                       related=[un(x) for x in re.findall(r"'((?:[^']|'')*)'", m.group(7) or '')])

    # 이미 만든 fix 파일을 순서대로 덮어써서 '현재 DB 상태'를 기준으로 삼는다
    by_id = {c['id']: w for w, c in cur.items()}
    fix_files = sorted(HERE.glob('[0-9][0-9]_words_fix*.sql'))
    upd = re.compile(r"^UPDATE public\.words SET meaning = '((?:[^']|'')*)', detailed_meaning = '((?:[^']|'')*)', related_words = (ARRAY\[(.*?)\]::text\[\]|'\{\}'::text\[\]) WHERE id = (\d+);", re.M)
    for f in fix_files:
        for m in upd.finditer(f.read_text()):
            w = by_id.get(int(m.group(5)))
            if w:
                cur[w].update(meaning=un(m.group(1)), detailed=un(m.group(2)),
                              related=[un(x) for x in re.findall(r"'((?:[^']|'')*)'", m.group(4) or '')])
    next_no = max([int(f.name[:2]) for f in fix_files] + [13]) + 1
    print(f'기준: 소스 SQL + fix {len(fix_files)}개 적용, 출력 번호 {next_no}')

    terms = parse_index(lines, body_start)
    tn = {norm(t): t for t in terms}
    for w in cur:                       # 찾아보기에서 두 줄로 갈라진 긴 용어명은 DB 이름으로 보완
        tn.setdefault(norm(w), w)
    TERMS.update(tn)
    print(f'찾아보기 용어 {len(terms)}개 (+DB 보완 {len(tn) - len(terms)}), 본문 시작 줄 {body_start}')

    B = lines[body_start:]
    # 표제어 줄: 같은 줄 오른쪽에 색인 글자(ㄱ, ㅅ)가 붙기도 한다. 들여쓰기 12칸 이하가 원칙이지만
    # 오른쪽으로 밀린 표제어(최저임금제)는 다음 줄 본문이 그 용어로 시작하는지로 구별한다.
    def head_text(l):
        return re.sub(r'\s+[ㄱ-ㅎ]$', '', l.strip())
    def next_text(i):
        for l in B[i + 1:i + 6]:
            if l.strip(): return norm(l.strip())
        return ''
    heads = []
    for i, l in enumerate(B):
        s = head_text(l)
        if not s or norm(s) not in tn: continue
        term = tn[norm(s)]
        if indent(l) <= 12 or next_text(i).startswith(norm(base(term))):
            heads.append((i, term))

    # 같은 용어가 여러 번 표제어로 잡히면(본문 속 한 줄짜리 언급) 뒤따르는 본문이 용어로 시작하는 것을 고른다
    entries = {}
    for k, (i, term) in enumerate(heads):
        end = heads[k + 1][0] if k + 1 < len(heads) else len(B)
        body, related = [], None
        for l in B[i + 1:end]:
            if is_noise(l):
                continue
            # 오른쪽 여백의 색인 글자(ㄱ, ㅅ …)가 본문 줄 끝에 넓은 공백 뒤로 붙는다
            l = re.sub(r'\s{2,}[ㄱ-ㅎ]\s*$', '', l)
            l = re.sub(r'^\s*[ㄱ-ㅎ]\s{2,}', '', l)
            s = l.strip()
            if s.startswith('연관검색어'):
                related = [x.strip() for x in re.split(r',\s*', s.replace('연관검색어', '').strip()) if x.strip()]
                continue
            if related is not None:
                continue
            body.append(s)
        text = join_lines(body)
        verified = norm(base(term))[:4] in norm(text[:150])
        cand = dict(word=term, detailed=text[:1200], meaning=first_sentence(text), related=(related or [])[:4], verified=verified)
        prev = entries.get(term)
        if prev is None or (cand['verified'] and not prev['verified']) or (cand['verified'] == prev['verified'] and len(text) > len(prev['detailed'])):
            entries[term] = cand
    print(f'표제어 {len(heads)}줄 -> 항목 {len(entries)}개')

    # 현재 SQL과 비교. 공백만 다른 것은 두 추출기의 줄 이음 규칙 차이라 건드리지 않는다.
    q = lambda s: "'" + s.replace("'", "''") + "'"
    ups, missing, ws_only = [], [], 0
    for w, c in cur.items():
        e = entries.get(w)
        if not e:
            missing.append(w); continue
        if (e['meaning'], e['detailed'], e['related']) == (c['meaning'], c['detailed'], c['related']):
            continue
        if norm(e['detailed']) == norm(c['detailed']) and norm(e['meaning']) == norm(c['meaning']) and e['related'] == c['related']:
            ws_only += 1; continue
        rel = 'ARRAY[' + ','.join(q(r) for r in e['related']) + ']::text[]' if e['related'] else "'{}'::text[]"
        ups.append(f"UPDATE public.words SET meaning = {q(e['meaning'])}, detailed_meaning = {q(e['detailed'])}, related_words = {rel} WHERE id = {c['id']};  -- {w}")
    print(f'현재 {len(cur)}개 중 실질 변경 {len(ups)}개, 공백만 차이(유지) {ws_only}개, 재추출에 없음 {len(missing)}개 {missing[:5]}')

    # 검증: 새 본문에 가나다 인접 용어가 글자 사이에 끼어 있는지
    names = list(entries)
    glued = 0
    for i, w in enumerate(names):
        d = entries[w]['detailed']
        for j in range(max(0, i - 4), min(len(names), i + 5)):
            t = base(names[j])
            if j == i or len(t) < 3 or t in base(w) or base(w) in t: continue
            if re.search(r'[가-힣]' + re.escape(t) + r'[가-힣]', d): glued += 1; break   # 공백 없이 글자 사이에 낀 것만
    short = [w for w in cur if w in entries and len(entries[w]['meaning']) < 20]
    print(f'검증 — 인접 용어 끼어듦 {glued}개, 20자 미만 meaning {len(short)}개 {short[:5]}')

    CHUNK = 70   # 파일당 ~110KB. SQL Editor가 큰 쿼리를 거부한 적이 있어 넉넉히 나눈다
    parts = [ups[i:i + CHUNK] for i in range(0, len(ups), CHUNK)]
    for n, part in enumerate(parts, 1):
        out = [f'-- ===== 본문 재추출 반영 {n}/{len(parts)} (parse800.py 생성) =====',
               '-- 러닝헤더가 끼어든 본문/뒤바뀐 본문을 PDF에서 다시 추출한 값으로 교체. id·코스·진도는 그대로.',
               f'-- 이 파일 {len(part)}행 / 전체 {len(ups)}행', ''] + part
        if n == len(parts):
            out += ['', "NOTIFY pgrst, 'reload schema';"]
        (HERE / f'{next_no}_words_fix_{n}.sql').write_text('\n'.join(out) + '\n')
    print(f'{next_no}_words_fix_1..{len(parts)}.sql 생성 ({len(ups)}행)')
    json.dump({w: e for w, e in entries.items()}, open(pathlib.Path(tempfile.gettempdir()) / 'bok800_entries.json', 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
