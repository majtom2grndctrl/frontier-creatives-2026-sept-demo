import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/routes/RootLayout'
import { ErrorBoundary } from '@/routes/ErrorBoundary'
import { Home } from '@/routes/Home'
import { PublicationDashboardPage } from '@/features/publication/PublicationDashboard'
import { DeveloperProfile } from '@/features/profile/DeveloperProfile'

// add new pages as extra children of the root route.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: <Home /> }],
  },
  // the dashboard brings its own full-viewport shell, so it sits outside the
  // root layout rather than nesting a second header inside it.
  {
    path: '/publication',
    element: <PublicationDashboardPage />,
    errorElement: <ErrorBoundary />,
  },
  // the profile screen is a different product with its own chrome band, so it
  // sits outside the root layout too rather than wearing this app's header.
  {
    path: '/profile',
    element: <DeveloperProfile />,
    errorElement: <ErrorBoundary />,
  },
])
