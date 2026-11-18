"""Build reviewed casual-speech content and guarded SQL from the original snapshot."""
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FIELDS = ('meaning', 'detailed_meaning', 'news_example', 'hint', 'learning_example', 'visuals')
NOUNS = {'주요', '필요', '개요', '중요', '동요', '민요'}


def casual(text):
    def ending(match):
        token = match[0]
        if token in NOUNS or token.endswith('수요'):
            return token
        if token.endswith('아니에요'):
            return token[:-4] + '아니야'
        for old, new in [('이에요', '이야'), ('예요', '야'), ('어떤가요', '어때'),
                         ('인가요', '일까'), ('보세요', '봐'), ('하세요', '해'),
                         ('주세요', '줘')]:
            if token.endswith(old):
                return token[:-len(old)] + new
        return token[:-1]
    text = re.sub(r'[가-힣]+요(?![가-힣])', ending, text)
    return re.sub(r'(줄어들|들어오)죠(?![가-힣])', r'\1지', text)


def convert(value):
    if isinstance(value, str):
        return casual(value)
    if isinstance(value, list):
        return [convert(v) for v in value]
    if isinstance(value, dict):
        return {k: convert(v) for k, v in value.items()}
    return value


def dump(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')


def check(before, after, path=''):
    assert type(before) is type(after), path
    if isinstance(before, dict):
        assert before.keys() == after.keys(), path
        for key in before:
            check(before[key], after[key], path + '/' + key)
    elif isinstance(before, list):
        assert len(before) == len(after), path
        for i, (old, new) in enumerate(zip(before, after)):
            check(old, new, path + '/' + str(i))
    elif isinstance(before, str):
        assert re.findall(r'\d+(?:[.,]\d+)*', before) == re.findall(r'\d+(?:[.,]\d+)*', after), path
        # Economic nouns must never lose their final 요.
        assert re.findall(r'[가-힣]*수요', before) == re.findall(r'[가-힣]*수요', after), path
    else:
        assert before == after, path  # Includes quiz answer indexes and chart data.


def sql(table, pk, changes):
    payload = json.dumps(changes, ensure_ascii=False, separators=(',', ':'))
    columns = sorted(changes[0]['after'])
    sets = ', '.join(f'{c} = r.{c}' for c in columns)
    return f"""-- Compare the complete original row before changing learning copy.
DO $casual_update$
DECLARE change jsonb; affected integer;
BEGIN
  FOR change IN SELECT value FROM jsonb_array_elements($payload${payload}$payload$::jsonb)
  LOOP
    UPDATE public.{table} AS current SET {sets}
    FROM jsonb_populate_record(NULL::public.{table}, change->'after') AS r
    WHERE current.{pk} = r.{pk} AND to_jsonb(current) = change->'before';
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 1 THEN
      RAISE EXCEPTION 'Content conflict in {table}: %', change->'before'->>'{pk}';
    END IF;
  END LOOP;
END $casual_update$;
"""


if __name__ == '__main__':
    words = json.loads((ROOT / 'words-before.json').read_text())
    updated = copy.deepcopy(words)
    changes = []
    for old, new in zip(words, updated):
        for field in FIELDS:
            new[field] = convert(old[field])
        check(old, new, str(old['id']))
        if old != new:
            changes.append({'before': old, 'after': new})
    # Every revised quiz keeps the option order, answer index and distinct options.
    for old, new in zip(words, updated):
        for ov, nv in zip(old['visuals'] or [], new['visuals'] or []):
            if ov.get('type') == 'quiz':
                assert ov['answer'] == nv['answer']
                assert len(set(ov['options'])) == len(set(nv['options'])), new['id']
    dump('words-after.json', updated)
    for i in range(0, len(changes), 100):
        batch = changes[i:i + 100]
        (ROOT / f'apply-{i // 100 + 1:02}.sql').write_text(sql('words', 'id', batch))
        reverse = [{'before': c['after'], 'after': c['before']} for c in batch]
        (ROOT / f'rollback-{i // 100 + 1:02}.sql').write_text(sql('words', 'id', reverse))
    courses = json.loads((ROOT / 'courses-before.json').read_text())
    updated_courses = copy.deepcopy(courses)
    for row in updated_courses:
        row['description'] = convert(row['description'])
    check(courses, updated_courses)
    assert courses == updated_courses, 'Review new course changes before extending this revision.'
    dump('audit.json', {
        'words': len(words), 'changedWords': len(changes),
        'changedFields': {field: sum(old[field] != new[field] for old, new in zip(words, updated)) for field in FIELDS},
        'numericValuesPreserved': True, 'quizAnswerIndexesPreserved': True, 'quizOptionOrderPreserved': True,
        'sha256Before': hashlib.sha256((ROOT / 'words-before.json').read_bytes()).hexdigest(),
    })
    print((ROOT / 'audit.json').read_text())
