-- resolve_profile_by_toss_key 분기 검증. 트랜잭션 내에서 ASSERT 후 ROLLBACK (DB에 흔적 안 남김).
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run. 전제: migration_toss_anonymous_key.sql 적용 완료.

BEGIN;

DO $$
DECLARE
  v_key1  TEXT := 'test_hash_' || repeat('a', 12);
  v_key2  TEXT := 'test_hash_' || repeat('b', 12);
  v_id1   UUID;
  v_id1b  UUID;
  v_gtok  UUID;
  v_new_gtok UUID;
  v_promo_key TEXT := 'test_hash_' || repeat('c', 12);
  v_promo_id  UUID;
  v_switch_id UUID;
  r RECORD;
BEGIN
  -- 1) 신규 키 → 새 행 생성
  SELECT out_id INTO v_id1 FROM resolve_profile_by_toss_key(v_key1, NULL);
  ASSERT v_id1 IS NOT NULL, '1: 신규 키로 프로필이 생성돼야 한다';

  -- 2) 같은 키 재호출 → 동일 out_id (재설치 시나리오)
  SELECT out_id INTO v_id1b FROM resolve_profile_by_toss_key(v_key1, NULL);
  ASSERT v_id1b = v_id1, '2: 같은 키는 동일 프로필을 반환해야 한다';

  -- 3) toss_anonymous_key가 NULL인 게스트 프로필 승격
  INSERT INTO profiles (guest_token) VALUES (gen_random_uuid()) RETURNING id, guest_token INTO v_promo_id, v_gtok;
  SELECT out_id INTO v_switch_id FROM resolve_profile_by_toss_key(v_promo_key, v_gtok);
  ASSERT v_switch_id = v_promo_id, '3: 게스트 토큰 + 새 키 → 그 게스트 행에 키가 붙어야 한다';
  ASSERT (SELECT toss_anonymous_key FROM profiles WHERE id = v_promo_id) = v_promo_key,
         '3: 승격된 행에 toss_anonymous_key가 채워져야 한다';

  -- 4) 이미 키가 붙은 프로필의 guest_token으로 다른 키 호출 → 승격(2단계) 0행 → 3단계 신규 생성(의도)
  SELECT out_id INTO v_switch_id
    FROM resolve_profile_by_toss_key('test_hash_' || repeat('d', 12), v_gtok);
  ASSERT v_switch_id <> v_promo_id, '4: 이미 키 붙은 게스트는 재승격되지 않고 새 프로필이 생성돼야 한다';

  -- 5) NULL / 8자 미만 → EXCEPTION
  BEGIN
    PERFORM resolve_profile_by_toss_key(NULL, NULL);
    ASSERT false, '5: NULL 키는 예외를 던져야 한다';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    PERFORM resolve_profile_by_toss_key('short', NULL);
    ASSERT false, '5: 8자 미만 키는 예외를 던져야 한다';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RAISE NOTICE '모든 ASSERT 통과';
END $$;

ROLLBACK;
