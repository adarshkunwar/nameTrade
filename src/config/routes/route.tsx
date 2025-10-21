import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
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

const RoutesContainer = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<Layout />}>
        {renderRoutes(RouteList)}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
)

export default RoutesContainer
