// 학습 콘텐츠(words, course_words, courses)를 받아 앱 번들용 JSON으로 저장한다.
// 앱이 실행마다 Supabase에서 받으면 egress가 커서 빌드 때 한 번만 받는다.
import { writeFileSync } from 'node:fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY가 필요합니다');

const PAGE = 1000;
const fetchAll = async path => {
  const all = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    all.push(...rows);
    if (rows.length < PAGE) return all;
  }
};

const [words, courseWords, courses] = await Promise.all([
  fetchAll('words?select=*&order=id'),
  fetchAll('course_words?select=course_id,word_id,position&order=position,course_id'),
  fetchAll('courses?select=*&order=sort_order'),
]);
if (!words.length || !courseWords.length || !courses.length) throw new Error('빈 콘텐츠 응답');

writeFileSync(new URL('../src/content/content.json', import.meta.url), JSON.stringify({ words, courseWords, courses }));
console.log(`content.json: words ${words.length}, course_words ${courseWords.length}, courses ${courses.length}`);
