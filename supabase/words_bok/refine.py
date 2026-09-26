"""words 콘텐츠 정제 (2026-09-26) -> 16_words_refine_*.sql

meanings.py(손으로 쓴 뜻·슬래시 분리·이름 정리)를 02~15 SQL로 재구성한 현재 DB 상태에 얹어
  - 신규 단어(분리 자식) INSERT + 부모 진도 복사
  - 전 행 UPDATE: word / meaning / hint(기본형 초성) / related_words(제어문자 제거·분리 이름 치환)
  - detailed_meaning: PDF 줄이음 자국(단어 속 공백, " ABC ")을 고친 행만 UPDATE
를 만든다. 순수 함수 — 다시 돌리면 16_*.sql을 통째로 다시 만든다.

사용: python3 refine.py   (그 뒤 python3 categories.py 로 17_courses.sql)
적용 순서: 16_words_refine_1..N -> 17_courses.sql (17이 새 id를 참조)
"""
import collections, glob, pathlib, re

from meanings import MEANINGS, RENAMES, SPLITS

HERE = pathlib.Path(__file__).parent
CHUNK = 70
NEW_ID_START = 717
CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'

un = lambda x: x.replace("''", "'")
q = lambda s: "'" + s.replace("'", "''") + "'"
arr = lambda xs: 'ARRAY[' + ','.join(q(x) for x in xs) + ']::text[]' if xs else "'{}'::text[]"
norm = lambda s: re.sub(r'\s+', '', s)
base = lambda w: re.split(r'[(/;]', w)[0].strip()


def load_baseline():
    """02~10 INSERT + 14_/15_ fix UPDATE = 현재 DB. 16 이후 파일은 읽지 않는다."""
    cur = {}
    pat = re.compile(r"^\((\d+),'((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)','((?:[^']|'')*)',(?:ARRAY\[(.*?)\]::text\[\]|'\{\}'::text\[\])\)", re.M)
    for f in sorted(glob.glob(str(HERE / '[01][0-9]_words_[0-9]*.sql'))):
        for m in pat.finditer(pathlib.Path(f).read_text()):
            cur[int(m.group(1))] = dict(word=un(m.group(2)), meaning=un(m.group(3)), detailed=un(m.group(4)), hint=un(m.group(6)),
                                        related=[un(x) for x in re.findall(r"'((?:[^']|'')*)'", m.group(7) or '')])
    upd = re.compile(r"^UPDATE public\.words SET meaning = '((?:[^']|'')*)', detailed_meaning = '((?:[^']|'')*)', related_words = (ARRAY\[(.*?)\]::text\[\]|'\{\}'::text\[\]) WHERE id = (\d+);", re.M)
    for f in sorted(HERE.glob('1[45]_words_fix*.sql')):
        for m in upd.finditer(f.read_text()):
            cur[int(m.group(5))].update(meaning=un(m.group(1)), detailed=un(m.group(2)),
                                        related=[un(x) for x in re.findall(r"'((?:[^']|'')*)'", m.group(4) or '')])
    return cur


def parts(word):
    """maskTerm(src/lib/quiz.ts)과 같은 토큰: 전체, 기본형, 슬래시 조각, 괄호 안."""
    ps = [word, base(word)] + [re.sub(r'\([^)]*\)', '', s).strip() for s in word.split('/')] + re.findall(r'\(([^)]*)\)', word)
    return {p for p in ps if len(p) >= 2}


def hint_of(word):
    """기본형의 초성. 영문·숫자 덩어리는 머리글자만 (Treasury Bill -> TB, CDS프리미엄 -> Cㅍㄹㅁㅇ)."""
    out = ''
    for ch in re.sub(r'[A-Za-z0-9]+', lambda m: m.group(0)[0], base(word)):
        o = ord(ch)
        if 0xAC00 <= o <= 0xD7A3:
            out += CHO[(o - 0xAC00) // 588]
        elif ch.isascii() and ch.isalnum():
            out += ch.upper()
    return out


def fix_spacing(texts):
    """PDF 줄바꿈 자리에 잘못 들어간 공백을 붙인다. 말뭉치 빈도로 판단: 한쪽이 한글 1음절인 인접 토큰 (a,b)에서
    붙인 꼴 a+b가 전체 본문에 5회 이상, 띄운 꼴은 1회 이하일 때만. 표본 검토에서 오탐 0.
    ponytail: 한국어 띄어쓰기 교정기 없이 말뭉치 통계로 잡는 만큼, 드문 단어의 줄바꿈은 남는다."""
    tok = collections.Counter(t for t in ' '.join(texts.values()).split())
    pair = collections.Counter()
    for t in texts.values():
        ts = t.split()
        pair.update(zip(ts, ts[1:]))
    joined = []

    def fix(text):
        ts = text.split()
        out = [ts[0]] if ts else []
        for b in ts[1:]:
            a = out[-1]
            bb = b.rstrip('.,)')
            if re.fullmatch(r'[가-힣]+', a) and re.fullmatch(r'[가-힣]+[.,)]?', b) and (len(a) == 1 or len(bb) == 1) \
                    and tok[a + b] >= 5 and pair[(a, b)] <= 1:
                joined.append(a + ' ' + b)
                out[-1] = a + b
            else:
                out.append(b)
        s = ' '.join(out)
        s = re.sub(r'([가-힣]) (다|미한다)\.', r'\1\2.', s)            # "이론이 다." / "의 미한다."
        s = re.sub(r'(?<=[가-힣0-9]) ABC (?=[가-힣(])', '', s)           # PDF 여백 글자
        return s

    return {k: fix(v) for k, v in texts.items()}, joined


def main():
    cur = load_baseline()
    assert len(cur) == 716, len(cur)

    fixed, joined = fix_spacing({i: r['detailed'] for i, r in cur.items()})
    print('공백 결합 %d건:' % len(joined), ', '.join(sorted(set(joined))))

    # 이름 변경 맵 (옛 이름 -> 새 이름들). related_words 치환용
    rename = {cur[i]['word']: [w] for i, w in RENAMES.items()}
    rename.update({cur[i]['word']: [w for w, _ in ps] for i, ps in SPLITS.items()})

    rows = {}          # id -> 최종 행
    new_rows = []      # (id, parent_id)
    nid = NEW_ID_START
    for i, r in sorted(cur.items()):
        row = dict(r, detailed=fixed[i])
        if i in SPLITS:
            (w0, m0), *rest = SPLITS[i]
            sib = [w for w, _ in SPLITS[i]]
            row.update(word=w0, meaning=m0, related=r['related'] + [w for w in sib if w != w0])
            for w, m in rest:
                rows[nid] = dict(row, word=w, meaning=m, related=r['related'] + [x for x in sib if x != w])
                new_rows.append((nid, i)); nid += 1
        else:
            row['meaning'] = MEANINGS[i]
            if i in RENAMES:
                row['word'] = RENAMES[i]
        rows[i] = row

    for r in rows.values():
        rel = []
        for x in r['related']:
            x = re.sub(r'[\x00-\x1f​-‏]', '', x).strip()
            for y in rename.get(x, [x]):
                if y and y != r['word'] and y not in rel:
                    rel.append(y)
        r['related'] = rel
        r['hint'] = hint_of(r['word'])

    # 검증
    words = [r['word'] for r in rows.values()]
    assert len(words) == len(set(words)), [w for w, c in collections.Counter(words).items() if c > 1]
    old_names = set(rename)
    for i, r in rows.items():
        m, w = r['meaning'], r['word']
        assert m and len(m) <= 45 and not m.endswith('.'), (i, w, m)
        assert not any(p in m for p in parts(w)), (i, w, m)
        assert r['hint'] and '(' not in r['hint'] and '/' not in r['hint'], (i, w, r['hint'])
        assert ' ABC ' not in r['detailed'] and not re.search(r'[가-힣] (다|미한다)\.', r['detailed']), (i, w)
        assert not (set(r['related']) & old_names), (i, w, r['related'])
    assert len(rows) == 747, len(rows)

    # SQL
    files = []
    head = ['-- ===== 콘텐츠 정제 %s (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====',
            '-- 뜻 전면 재작성·슬래시 항목 분리(신규 %d행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.' % len(new_rows),
            '-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql', '']
    ins = ['INSERT INTO public.words (id, word, meaning, detailed_meaning, news_example, hint, related_words) VALUES']
    ins.append(',\n'.join(f"({i},{q(rows[i]['word'])},{q(rows[i]['meaning'])},{q(rows[i]['detailed'])},'',{q(rows[i]['hint'])},{arr(rows[i]['related'])})" for i, _ in new_rows) + ';')
    ins += ['', '-- 분리 자식에 부모 진도 복사: 패스가 코스 잠금을 words.every(known)으로 판정하므로 없으면 뒤 코스가 다시 잠긴다.',
            '-- INSERT 트리거(미션 진행·XP 지급)가 타지 않게 잠시 끈다 (README 되돌리기와 동일).',
            'ALTER TABLE public.word_progress DISABLE TRIGGER trg_word_progress_mission;']
    for i, p in new_rows:
        ins.append(f"INSERT INTO public.word_progress (user_id, word_id, status, ease, interval_d, reps, due_date, last_grade) "
                   f"SELECT user_id, {i}, status, ease, interval_d, reps, due_date, last_grade FROM public.word_progress WHERE word_id = {p} "
                   f"ON CONFLICT (user_id, word_id) DO NOTHING;  -- {rows[i]['word']} <- {cur[p]['word']}")
    ins.append('ALTER TABLE public.word_progress ENABLE TRIGGER trg_word_progress_mission;')
    files.append(ins)

    short = [f"UPDATE public.words SET word = {q(r['word'])}, meaning = {q(r['meaning'])}, hint = {q(r['hint'])}, related_words = {arr(r['related'])} WHERE id = {i};  -- {cur[i]['word']}"
             for i, r in sorted(rows.items()) if i in cur]
    files += [short[k:k + CHUNK] for k in range(0, len(short), CHUNK)]
    detail = [f"UPDATE public.words SET detailed_meaning = {q(fixed[i])} WHERE id = {i};  -- {cur[i]['word']}"
              for i in sorted(cur) if fixed[i] != cur[i]['detailed']]
    files += [detail[k:k + CHUNK] for k in range(0, len(detail), CHUNK)]

    for old in HERE.glob('16_words_refine_*.sql'):
        old.unlink()
    for n, body in enumerate(files, 1):
        out = [head[0] % f'{n}/{len(files)}'] + head[1:] + body
        if n == len(files):
            out += ['', "NOTIFY pgrst, 'reload schema';", '', '-- 확인:', '-- SELECT count(*) FROM public.words;  -- 747',
                    "-- SELECT count(*) FROM public.words WHERE hint LIKE '%(%' OR hint LIKE '%/%' OR meaning LIKE '%.';  -- 0"]
        (HERE / f'16_words_refine_{n}.sql').write_text('\n'.join(out) + '\n')
    print(f'16_words_refine_1..{len(files)}.sql 생성: 신규 {len(new_rows)}행, 단문 UPDATE {len(short)}행, 본문 UPDATE {len(detail)}행')


if __name__ == '__main__':
    main()
