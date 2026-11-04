import { COURSE_NAMES, TOPIC_IMAGES } from '../lib/topicImages';

// 주제 썸네일: 작은 정사각 그림(가로 장면은 가운데를 잘라 씀). courseId가 있으면 코스 그림(public/courses), 그림이 없는 주제는 회색 바탕에 주제 첫 글자(대체 규칙)
export const TopicThumb = ({ category, courseId, size = 40, height = size }: { category: string; courseId?: string; size?: number; height?: number }) => {
  const src = courseId && COURSE_NAMES[courseId] ? `/courses/course-${courseId}.svg` : TOPIC_IMAGES[category];
  return src
    ? <img className="topic-thumb" src={src} alt="" aria-hidden="true" width={size} height={height} loading="lazy" decoding="async" style={{ width: size, height }} />
    : <span className="topic-thumb topic-thumb-fallback" aria-hidden="true" style={{ width: size, height }}>{Array.from(category)[0]}</span>;
};
