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

## 확인

`00_backup.sql` 직후:

```sql
SELECT count(*) FROM public.words_backup_20260924;   -- 275 (기존 단어 수)
```

전부 끝난 뒤:

```sql
SELECT count(*) FROM public.words;         -- 716
SELECT count(*) FROM public.courses;       -- 29
SELECT count(*) FROM public.course_words;  -- 716
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

- `meaning`이 한국은행 원문 첫 문장이라 격식체이고 약 26%가 110자에서 `…`로 잘린다
- `news_example`이 비어 있어 빈칸 채우기 퀴즈 유형이 비활성화된다
- 800개 중 716개 — 색인과 본문을 맞추지 못한 37개와 길이가 비정상인 12개를 제외했다
