import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
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

// 앱 테마(시스템/라이트/다크)를 TDS 컴포넌트(바텀시트 등)에 전달
const TdsThemeBridge = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme()
  return <TDSMobileAITProvider colorScheme={isDark ? 'dark' : 'light'}>{children}</TDSMobileAITProvider>
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
