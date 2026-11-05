"""상세 설명 재작성 2차(715개) 검사와 묶음별 SQL 생성.

batch-1.json ~ batch-6.json을 읽어 규칙을 검사하고, 묶음마다 apply/verify/rollback SQL을 만든다.
SQL은 DO 블록 하나라 SQL Editor가 문장을 나눠 실행해도 백업과 갱신이 함께 되거나 함께 취소된다.
대상 행의 단어명·원문 글자 수가 검토 때와 다르면 그 묶음 전체를 중단한다.
"""
import json

import sys
from pathlib import Path

HERE = Path(__file__).parent
SAMPLE_IDS = {1 + i * 25 for i in range(30)}  # 1차 샘플(이미 적용)
NOT_BOK = {495, 572}
EXPECTED = {i for i in range(1, 748)} - SAMPLE_IDS - NOT_BOK
BACKUP = 'public.words_detailed_meaning_backup_v1'


def check(rows):
    errors = []
    for r in rows:
        t = r['after']
        if t.count('요.') != 3 or not t.endswith('요.'):
            errors.append(f"{r['id']}: sentence rule")
        if not 90 <= len(t) <= 160:
            errors.append(f"{r['id']}: length {len(t)}")
        bad = sorted({c for c in t if c in '\n\r\t' or not (c.isascii() or '가' <= c <= '힣' or c in '·‘’…×')})
        if bad:
            errors.append(f"{r['id']}: chars {bad}")
    return errors


def sql_files(n, rows):
    payload = json.dumps([{k: r[k] for k in ('id', 'word', 'beforeLength', 'after')} for r in rows], ensure_ascii=False)
    assert '$payload$' not in payload
    ids = ','.join(str(r['id']) for r in rows)
    cnt = len(rows)
    rec = 'r(id integer, word text, "beforeLength" integer, after text)'
    apply = f"""-- 상세 설명(detailed_meaning) 재작성 2차 묶음 {n}: {cnt}개 (id {rows[0]['id']}~{rows[-1]['id']}).
-- 한국은행 800선 원문을 해요체 3문장으로 새로 씀. detailed_meaning 한 열만 바꾸고 원문은 {BACKUP}에 남긴다.
-- DO 블록 하나: 실패하면 이 묶음 전체가 취소된다. 단어명·원문 글자 수가 검토 때와 다르면 중단한다.
DO $apply_v2_{n}$
DECLARE
  v_payload jsonb := $payload${payload}$payload$::jsonb;
  v_bad text;
BEGIN
  PERFORM set_config('lock_timeout', '10s', true);
  IF jsonb_array_length(v_payload) <> {cnt} THEN RAISE EXCEPTION 'payload size must be {cnt}'; END IF;
  IF (SELECT count(*) FROM public.words) <> 1233 THEN RAISE EXCEPTION 'words count changed since review'; END IF;
  IF to_regclass('{BACKUP}') IS NULL THEN RAISE EXCEPTION 'backup table missing; apply revision v1 first'; END IF;
  IF EXISTS (SELECT 1 FROM {BACKUP} WHERE id IN ({ids})) THEN
    RAISE EXCEPTION 'backup already has rows of batch {n}; it was applied before';
  END IF;

  SELECT string_agg(r.id::text, ',') INTO v_bad
  FROM jsonb_to_recordset(v_payload) AS {rec}
  LEFT JOIN public.words w ON w.id = r.id
  WHERE w.id IS NULL OR w.word IS DISTINCT FROM r.word OR char_length(w.detailed_meaning) <> r."beforeLength";
  IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'rows changed since review: %', v_bad; END IF;

  INSERT INTO {BACKUP} (id, word, detailed_meaning)
  SELECT w.id, w.word, w.detailed_meaning FROM public.words w WHERE w.id IN ({ids});

  UPDATE public.words w SET detailed_meaning = r.after
  FROM jsonb_to_recordset(v_payload) AS {rec}
  WHERE w.id = r.id;

  IF (SELECT count(*) FROM public.words w JOIN jsonb_to_recordset(v_payload) AS {rec} ON r.id = w.id
      WHERE w.detailed_meaning = r.after) <> {cnt} THEN
    RAISE EXCEPTION 'updated row count mismatch';
  END IF;
  IF (SELECT count(*) FROM {BACKUP} WHERE id IN ({ids})) <> {cnt} THEN
    RAISE EXCEPTION 'backup row count mismatch';
  END IF;
END
$apply_v2_{n}$;
"""
    verify = f"""-- 2차 묶음 {n} 적용 확인(읽기 전용). applied_rows와 backed_up_rows가 {cnt}이면 정상.
WITH r AS (SELECT * FROM jsonb_to_recordset($payload${payload}$payload$::jsonb) AS {rec})
SELECT count(*) FILTER (WHERE w.detailed_meaning = r.after) AS applied_rows,
       count(b.id) AS backed_up_rows,
       {cnt} AS expected
FROM r JOIN public.words w ON w.id = r.id
LEFT JOIN {BACKUP} b ON b.id = r.id;
"""
    rollback = f"""-- 2차 묶음 {n} 되돌리기: 백업 테이블의 원문으로 {cnt}개 행을 복원한다. DO 블록 하나라 실패하면 전부 취소된다.
DO $rollback_v2_{n}$
DECLARE
  v_payload jsonb := $payload${payload}$payload$::jsonb;
  v_bad text;
BEGIN
  PERFORM set_config('lock_timeout', '10s', true);
  IF (SELECT count(*) FROM {BACKUP} WHERE id IN ({ids})) <> {cnt} THEN RAISE EXCEPTION 'backup rows missing; cannot restore'; END IF;
  SELECT string_agg(r.id::text, ',') INTO v_bad
  FROM jsonb_to_recordset(v_payload) AS {rec} JOIN public.words w ON w.id = r.id
  WHERE w.detailed_meaning IS DISTINCT FROM r.after;
  IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'rows changed after revision: %', v_bad; END IF;
  UPDATE public.words w SET detailed_meaning = b.detailed_meaning
  FROM {BACKUP} b WHERE w.id = b.id AND w.word = b.word AND b.id IN ({ids});
  IF (SELECT count(*) FROM public.words w JOIN {BACKUP} b USING (id) WHERE b.id IN ({ids}) AND w.detailed_meaning = b.detailed_meaning) <> {cnt} THEN
    RAISE EXCEPTION 'restored row count mismatch';
  END IF;
  DELETE FROM {BACKUP} WHERE id IN ({ids});
END
$rollback_v2_{n}$;
"""
    (HERE / f'apply-batch-{n}.sql').write_text(apply)
    (HERE / f'verify-batch-{n}.sql').write_text(verify)
    (HERE / f'rollback-batch-{n}.sql').write_text(rollback)


def main():
    all_rows, problems = [], []
    for n in range(1, 7):
        rows = json.loads((HERE / f'batch-{n}.json').read_text())
        rows.sort(key=lambda r: r['id'])
        problems += [f'batch-{n} ' + e for e in check(rows)]
        all_rows += rows
    ids = [r['id'] for r in all_rows]
    if len(ids) != len(set(ids)):
        problems.append('duplicate ids')
    missing, extra = sorted(EXPECTED - set(ids)), sorted(set(ids) - EXPECTED)
    if missing or extra:
        problems.append(f'missing {missing} extra {extra}')
    if problems:
        print('\n'.join(problems))
        sys.exit(1)
    if '--write' in sys.argv:
        for n in range(1, 7):
            sql_files(n, sorted(json.loads((HERE / f'batch-{n}.json').read_text()), key=lambda r: r['id']))
    print(f'ok: {len(all_rows)} rows, len {min(len(r["after"]) for r in all_rows)}~{max(len(r["after"]) for r in all_rows)}')


if __name__ == '__main__':
    main()
