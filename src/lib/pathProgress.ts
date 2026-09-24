import { Storage } from './storage';

// 퀴즈·복습 노드 완료 표시. 서버에 기록할 곳이 없어 기기에만 남기며, 진행(잠금)에는 쓰지 않고 표시에만 쓴다.
// 유실돼도 잃는 건 체크 표시뿐이라 fail-open.
const KEY = 'path_quiz_done';

export const loadDoneNodes = async (): Promise<Set<string>> => {
  try {
    const raw = await Storage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

export const markNodeDone = async (nodeId: string): Promise<void> => {
  try {
    const done = await loadDoneNodes();
    done.add(nodeId);
    await Storage.setItem(KEY, JSON.stringify([...done]));
  } catch { /* 표시용이라 무시 */ }
};
