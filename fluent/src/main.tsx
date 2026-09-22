import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/router'
import { AppThemeProvider } from '@/theme/AppThemeProvider'

const container = document.getElementById('root')

if (!container) {
  throw new Error('could not find the #root element to mount into')
}

createRoot(container).render(
  <StrictMode>
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  </StrictMode>,
)
