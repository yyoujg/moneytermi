# 경제금융용어 800선 교체 (716개)

SQL Editor에 1MB 쿼리를 넣을 수 없어 파일을 나눴다. **파일 이름 순서대로** 실행한다.

| 순서 | 파일 | 내용 |
|---|---|---|
| 1 | `00_backup.sql` | 기존 4개 테이블을 `*_backup_20260924`로 복사. RLS를 켜고 클라이언트 권한을 회수한다. **재실행 금지** — `DROP TABLE` 후 다시 복사하므로 지금 돌리면 유일한 백업을 새 데이터로 덮어쓴다 |
| 2 | `01_delete.sql` | **되돌릴 수 없음.** 기존 단어·코스·진도 삭제 |
| 3~11 | `02_words_*.sql` ~ `10_words_*.sql` | 단어 716개를 80개씩 나눠 INSERT |
| 12 | `11_courses.sql` | 코스 29개 + 코스-단어 연결 716행 |
| 13 | `12_course_titles.sql` | (건너뜀 — 14번이 대체) 가나다순 코스 제목 복원 |
| 14 | `13_recategorize.sql` | **코스 재분류** — 가나다순 29개 → 17주제 37개. `categories.py`가 생성(분류 원본도 그 파일). `word_progress`는 건드리지 않아 진도 보존 |
| 15 | `14_words_fix_1.sql` ~ `14_words_fix_5.sql` | **본문 재추출** — 첫 추출이 페이지 러닝헤더(인접 용어명)를 본문에 끼워 넣어 103개가 오염되고 8개 이상은 본문이 옆 용어 것으로 밀려 있었다. `parse800.py`가 PDF에서 다시 추출해 실질적으로 달라진 338행만 UPDATE. 순서대로 5개 실행 |

| 16 | `15_words_fix_1.sql` ~ `15_words_fix_2.sql` | 본문 줄 끝에 붙어 있던 PDF 여백 색인 글자(`…평균 ㄱ 생산비용`) 제거. 86행. 14번 적용 후 실행 |
| 17 | `16_words_refine_1.sql` ~ `16_words_refine_36.sql` | **콘텐츠 정제(2026-09-26)** — `refine.py`가 `meanings.py`에서 생성. ① 뜻 747개 전부 쉬운 한 줄로 재작성(원문 첫 문장 110자 잘림·배경 설명 문장 폐기) ② 슬래시 항목 28개를 개념별로 분리해 신규 31행(id 717~747, 부모 진도 복사) ③ 동의어 묶음 17개 이름 정리 ④ 힌트를 기본형 초성으로(181행 `ㄱㅅㅈ()` 꼴 수정) ⑤ related_words 제어문자 제거·분리 이름 치환 ⑥ 본문 줄이음 자국(`의 미한다`, ` ABC `) 138행. 파일당 문장 25개 — 첫 적용 때 SQL Editor가 각 파일의 앞 40개 문장쯤만 실행한 적이 있어 작게 나눔. 부분 적용됐으면 `python3 refine.py --rest <라이브 덤프.json>`으로 나머지만 담은 `16_words_refine_rest_*.sql`을 만들어 붙여넣고, 적용 후 rest 파일은 지운다 |
| 18 | `17_courses_1.sql` ~ `17_courses_2.sql` | 코스 재생성 — 17주제 **39개**. `categories.py`가 생성(13을 대체). 신규 id를 참조하므로 **반드시 17번 뒤에** 실행. `word_progress` 보존 |

`parse800.py`는 `pdftotext -layout` 결과에서 들여쓰기로 러닝헤더를 걸러내고, 줄 이음은 첫 추출의 정상 항목에서 학습한 문자별 공백 확률(`join_table.json`)로 결정한다. PDF 경로: `/Users/dev/경제용어원천자료/2026_경제금융용어 800선.pdf`. 다시 돌리면 현재 SQL과 비교해 달라진 행만 다시 만든다. **은퇴(2026-09-26) — 다시 돌리지 말 것.** `meaning`을 PDF 첫 문장으로 되돌려 손으로 쓴 뜻을 덮어쓴다.

SQL Editor에 45줄 넘게 붙여넣으면 앞부분만 실행되는 일이 있었다(16_*·17_* 부분 적용 → `*_rest.sql`로 보충). 파일당 25문장 이하로 나누고, 실행 후 확인 쿼리로 행 수를 맞춘다.

뜻·단어명을 고칠 때는 `meanings.py`를 고치고 `python3 refine.py` → `python3 categories.py`를 다시 돌린다(16·17을 통째로 다시 만든다). 실행 후 반드시 `SELECT count(*) FROM public.course_words;`로 747인지 확인한다.

## 테셋 단어·레슨·예문 추가 (2026-10-07)

테셋 블로그(경제이론 02~68편)를 바탕으로 단어 213개(id 1001~1213, `sources = ['tesat']`), 기존 단어 53개의 레슨 카드·퀴즈, 전 단어 `news_example`(빈칸 퀴즈용 기사체 예문, 실제 기사 인용 아님)을 넣었다. **이 순서대로** 실행한다.

| 순서 | 파일 | 내용 |
|---|---|---|
| 1 | `../migration_rename_taylor_rule.sql` | 607 단어명에서 영문 괄호를 빼 `테일러 준칙`으로, related_words도 치환 |
| 2 | `19_words_tesat_1.sql` ~ `19_words_tesat_4.sql` | 새 단어 213개 upsert. `new_words.py`가 `tesat_words.py`를 읽어 생성 |
| 3 | `17_courses_1.sql` ~ `17_courses_4.sql` | 코스 재생성 — **78개 / 연결 1213행**. 새 id를 참조하므로 2번 뒤에. `word_progress` 보존 |
| 4 | `../migration_lesson_tesat_micro_1.sql` ~ `_2`, `../migration_lesson_tesat_macro_1.sql` ~ `_2` | 기존 단어 53개에 text/table/flow 카드와 퀴즈 2개(lessonCheck 1개). 다시 실행해도 중복 없음 |
| 5 | `../migration_news_examples_1.sql` ~ `_13.sql` | 단어 1213개 `news_example`. 2번 뒤에 |

```sql
SELECT count(*) FROM public.words;                          -- 1213
SELECT count(*) FROM public.courses;                        -- 78
SELECT count(*) FROM public.course_words;                   -- 1213
SELECT count(*) FROM public.words WHERE news_example <> ''; -- 1213
NOTIFY pgrst, 'reload schema';
```

앱은 `words`·`course_words`를 1000행씩 이어 받는다(`AppContext.tsx` `fetchAll`).

**생성기 다시 돌리기.** `categories.py`·`new_words.py`는 적용 후 지운 기준 SQL(`02~10_words_*`, `14~16_*`, `18_words_new.sql`)에서 기존 단어 id·이름을 읽는다. 돌리기 전에 커밋 `72bef94^`에서 임시로 되살리고, 끝나면 지운다(커밋하지 않는다).

```bash
for f in $(git show 72bef94 --name-only --format= | grep -E 'words_bok/((0[2-9]|10|1[456])_words|18_words_new)'); do git show 72bef94^:$f > $f; done
```

`18_words_new.sql`(748~1000)은 다시 적용하지 않는다 — `visuals`를 덮어써 레슨 파일이 붙인 카드가 사라진다. 새 단어는 `tesat_words.py`에 id를 이어 붙이고 `19_*`만 적용한다.

## 확인

`00_backup.sql` 직후:

```sql
SELECT count(*) FROM public.words_backup_20260924;   -- 275 (기존 단어 수)
```

전부 끝난 뒤:

```sql
SELECT count(*) FROM public.words;         -- 747
SELECT count(*) FROM public.courses;       -- 39
SELECT count(*) FROM public.course_words;  -- 747
SELECT count(*) FROM public.words WHERE hint LIKE '%(%' OR hint LIKE '%/%' OR meaning LIKE '%.';  -- 0
NOTIFY pgrst, 'reload schema';
```

## 되돌리기

```sql
-- word_progress를 먼저 비워야 UNIQUE(user_id, word_id) 충돌이 없고,
-- 복원 INSERT가 미션/XP 트리거를 태우지 않게 트리거를 잠시 끈다.
DELETE FROM public.word_progress;
DELETE FROM public.course_words;
DELETE FROM public.courses;
DELETE FROM public.words;
INSERT INTO public.words        SELECT * FROM public.words_backup_20260924;
INSERT INTO public.courses      SELECT * FROM public.courses_backup_20260924;
INSERT INTO public.course_words SELECT * FROM public.course_words_backup_20260924;
ALTER TABLE public.word_progress DISABLE TRIGGER trg_word_progress_mission;
INSERT INTO public.word_progress SELECT * FROM public.word_progress_backup_20260924;
ALTER TABLE public.word_progress ENABLE TRIGGER trg_word_progress_mission;
```

## 알려진 제약

- 분리된 자식 단어의 `detailed_meaning`은 부모 원문을 그대로 복사한 것이라 두 개념을 함께 설명한다
- 본문 줄이음 자국은 말뭉치 빈도로 잡히는 것만 고쳤다(`간접금융에 서는`처럼 두 글자 이상 조각은 남음)
- 800개 중 716개 — 색인과 본문을 맞추지 못한 37개와 길이가 비정상인 12개를 제외했다
