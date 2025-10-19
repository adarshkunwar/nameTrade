import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/config/store'
import { RouteList } from './routesList'
import Layout from '@/components/layout/Layout'
import { AuthGuard } from './protectedRoutes'

const Login = lazy(() => import('@/features/auth'))

const renderRoutes = (routes: any) => {
  return routes.map((route: any, i: number) => {
    if (route.children) {
      return route?.children?.map((child: any, j: number) => (
        <Route path={child?.path} element={<child.component />} key={`${i}-${j}`} />
      ))
    }

    return <Route path={route.path} element={<route.component />} key={i} />
  })
}

const RoutesContainer = () => {
  const isAuthenticate = useSelector((state: RootState) => state?.auth?.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticate && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    } else if (isAuthenticate && location.pathname === '/login') {
      navigate('/', { replace: true })
    }
  }, [isAuthenticate, location.pathname, navigate])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          {renderRoutes(RouteList)}
        </Route>
        <Route
          element={
            <AuthGuard>
              <Outlet />
            </AuthGuard>
          }
        >
          <Route path="*" element={<Navigate to="/page-not-found" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default RoutesContainer
