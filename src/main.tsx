import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { ColorSchemeArea } from '@toss/tds-mobile'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './hooks/useTheme'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
  enabled: import.meta.env.PROD,
})

// 앱 테마(시스템/라이트/다크)를 TDS 컴포넌트(바텀시트 등)에 전달.
// ColorSchemeArea가 TDS 색 스킴 컨텍스트를 설정 → 포털되는 바텀시트도 React 컨텍스트로 상속.
const TdsThemeBridge = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme()
  return (
    <TDSMobileAITProvider>
      <ColorSchemeArea theme={isDark ? 'dark' : 'light'}>{children}</ColorSchemeArea>
    </TDSMobileAITProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TdsThemeBridge>
        <App />
      </TdsThemeBridge>
    </ThemeProvider>
  </StrictMode>,
)
