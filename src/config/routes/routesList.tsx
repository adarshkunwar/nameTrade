import { lazy } from 'react'
import type { TRoute } from '@/types/route'

export const RouteList: TRoute[] = [
  {
    path: '/',
    component: lazy(() => import('@/features/home')),
  },
] as const
