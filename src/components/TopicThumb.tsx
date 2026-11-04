import { TOPIC_IMAGES } from '../lib/topicImages';

// 주제 썸네일: 작은 정사각 사진. 사진이 없는 주제는 회색 바탕에 주제 첫 글자(대체 규칙)
export const TopicThumb = ({ category, size = 40 }: { category: string; size?: number }) => {
  const name = TOPIC_IMAGES[category];
  return name
    ? <img className="topic-thumb" src={`/topics/${name}.jpg`} alt="" aria-hidden="true" width={size} height={size} loading="lazy" decoding="async" style={{ width: size, height: size }} />
    : <span className="topic-thumb topic-thumb-fallback" aria-hidden="true" style={{ width: size, height: size }}>{Array.from(category)[0]}</span>;
};
