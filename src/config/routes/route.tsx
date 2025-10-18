import { Suspense } from 'react'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './protectedRoutes'
import { useSelector } from 'react-redux'
import type { RootState } from '@/config/store'
import { RouteList } from './routesList'
import Layout from '@/components/layout/Layout'

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
    if (!isAuthenticate && !RouteList?.some((route: any) => route.path === location?.pathname)) {
      navigate('/login')
    }
  }, [location.pathname, isAuthenticate])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {renderRoutes(RouteList)}
        </Route>
        <Route element={<ProtectedRoute isAuthenticated={true} />}>
          <Route path="*" element={<Navigate to="/page-not-found" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default RoutesContainer
