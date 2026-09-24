-- 기본 닉네임을 랜덤 배정으로
--
-- profiles.nickname DEFAULT가 '예비슈퍼개미' 고정이라 리그 랭킹에 같은 이름이 줄줄이 뜬다.
-- 프로필은 두 경로로 만들어진다 — 클라 게스트 INSERT, resolve_profile_by_toss_key RPC.
-- 둘 다 nickname을 넘기지 않으므로 컬럼 DEFAULT만 바꾸면 양쪽이 함께 해결된다.
--
-- 단어 목록은 src/lib/nickname.ts와 같게 유지한다(닉네임 입력 10자 제한에 맞춰 3+3+3=9자).
-- 적용: Supabase 대시보드 SQL Editor에서 실행.

BEGIN;

CREATE OR REPLACE FUNCTION public.random_nickname() RETURNS TEXT
LANGUAGE sql VOLATILE AS $$
  SELECT (ARRAY['성실한','똑똑한','용감한','느긋한','재빠른','든든한','따뜻한',
                '신중한','대담한','꼼꼼한','유쾌한','침착한','단단한'])[floor(random()*13)+1]
      || (ARRAY['너구리','다람쥐','수달','판다','여우','펭귄','올빼미',
                '두더지','햄스터','알파카','코알라','비버','오리','고래'])[floor(random()*14)+1]
      || (floor(random()*900)+100)::text
$$;

ALTER TABLE public.profiles ALTER COLUMN nickname SET DEFAULT public.random_nickname();

COMMIT;

-- 기존 '예비슈퍼개미' 사용자도 한 번에 바꾸려면 아래를 따로 실행한다.
-- 앱에는 닉네임 게이트가 있어 다음 접속 때 직접 정하게 되므로 선택 사항이다.
--
--   UPDATE public.profiles SET nickname = public.random_nickname()
--   WHERE nickname IN ('예비슈퍼개미', '새친구');
--
-- 확인
--   SELECT public.random_nickname();
--   SELECT column_default FROM information_schema.columns
--     WHERE table_name='profiles' AND column_name='nickname';
