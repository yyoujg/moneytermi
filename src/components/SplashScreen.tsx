import { OTTER_IMAGES } from '../lib/otter';

export const SplashScreen = () => (
  <div className="splash-screen" role="status" aria-live="polite" aria-label="머니터미를 불러오는 중">
    <div className="splash-frame">
      <div className="splash-brand" aria-hidden="true">머니터미</div>

      <div className="splash-mascot-wrap" aria-hidden="true">
        <img className="splash-mascot" src={OTTER_IMAGES.hello} width={174} height={174} alt="" />
      </div>

      <div className="splash-copy">
        <p>곧 시작해요</p>
        <h1>오늘의 학습을 준비하고 있어요</h1>
      </div>

      <div className="splash-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  </div>
);
