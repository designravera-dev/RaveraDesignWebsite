import { Suspense, lazy } from 'react'
import LandingThree from './site/landing3/LandingThree'
import { CATALOG_PATH, isCatalogPath, normalizePath } from './site/catalog/catalogRoutes'
import { AuthProvider } from './site/shared/AuthContext'
import ProtectedRoute from './site/shared/ProtectedRoute'

const LandingOne = lazy(() => import('./alternatives/landing1/LandingOne'))
const LandingTwo = lazy(() => import('./alternatives/landing2/LandingTwo'))
const CatalogPage = lazy(() => import('./site/catalog/CatalogPage'))
const AdminLoginPage = lazy(() => import('./site/admin/AdminLoginPage'))
const AdminCatalogPage = lazy(() => import('./site/admin/AdminCatalogPage'))

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const path = normalizePath(window.location.pathname)
  if (path === '/admin' || path === '/admin/catalogo') {
    return (
      <ProtectedRoute>
        <Suspense fallback={null}><AdminCatalogPage /></Suspense>
      </ProtectedRoute>
    )
  }
  if (path === '/admin/login') return <Suspense fallback={null}><AdminLoginPage /></Suspense>
  if (path === '/prototipos/landing1') return <Suspense fallback={null}><LandingOne /></Suspense>
  if (path === '/prototipos/landing2') return <Suspense fallback={null}><LandingTwo /></Suspense>
  if (isCatalogPath(path)) return <Suspense fallback={null}><CatalogPage productSlug={path === CATALOG_PATH ? undefined : path.slice(CATALOG_PATH.length + 1)} /></Suspense>
  return <LandingThree />
}
