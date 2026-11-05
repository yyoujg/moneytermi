import { Storage } from './storage';

// 퀴즈·복습 노드 완료 표시. 서버에 기록할 곳이 없어 기기에만 남긴다(유실 대비는 CourseScreen이 같은 코스의 뒤 학습 완료로 추정).
// 계정마다 키를 나눈다. 예전 공용 키는 처음 읽는 계정이 한 번 옮겨 받는다.
const LEGACY_KEY = 'path_quiz_done';
const keyFor = (profileId: string) => `${LEGACY_KEY}:${profileId}`;

const read = async (key: string): Promise<string[] | null> => {
  const raw = await Storage.getItem(key);
  return raw ? (JSON.parse(raw) as string[]) : null;
};

export const loadDoneNodes = async (profileId?: string | null): Promise<Set<string>> => {
  if (!profileId) return new Set();
  try {
    const own = await read(keyFor(profileId));
    if (own) return new Set(own);
    const legacy = await read(LEGACY_KEY);
    if (!legacy) return new Set();
    await Storage.setItem(keyFor(profileId), JSON.stringify(legacy));
    await Storage.removeItem(LEGACY_KEY);
    return new Set(legacy);
  } catch {
    return new Set();
  }
};

export const markNodeDone = async (nodeId: string, profileId?: string | null): Promise<void> => {
  if (!profileId) return;
  try {
    const done = await loadDoneNodes(profileId);
    done.add(nodeId);
    await Storage.setItem(keyFor(profileId), JSON.stringify([...done]));
  } catch { /* 표시용이라 무시 */ }
};
