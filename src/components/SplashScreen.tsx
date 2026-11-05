// 375x812 스플래시 그림. 화면 비율이 달라도 잘리지 않게 contain, 남는 여백은 그림과 같은 바탕색(--color-splash-bg)이 채운다
export const SplashScreen = () => (
  <div className="splash-screen" role="status" aria-live="polite" aria-label="머니터미를 불러오는 중">
    <img className="splash-art" src="/splash/splash.svg" alt="" aria-hidden="true" />
    <span className="splash-spinner" aria-hidden="true" />
  </div>
);
