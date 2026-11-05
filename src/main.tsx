/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { ColorSchemeArea } from '@toss/tds-mobile'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
  enabled: import.meta.env.PROD,
})

// 앱인토스 미니앱은 라이트 모드만 지원한다(체크리스트 '미니앱 테마는 라이트 모드'). OS가 다크여도 TDS를 라이트로 고정
const TdsLightArea = ({ children }: { children: React.ReactNode }) => (
  <TDSMobileAITProvider>
    <ColorSchemeArea theme="light">{children}</ColorSchemeArea>
  </TDSMobileAITProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TdsLightArea>
      <App />
    </TdsLightArea>
  </StrictMode>,
)
