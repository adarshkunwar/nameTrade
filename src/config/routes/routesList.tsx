import { lazy } from 'react'
import type { TRoute } from '@/types/route'

export const RouteList: TRoute[] = [
  {
    path: '/',
    component: lazy(() => import('@/features/home')),
  },
  {
    path: '/username/:username',
    component: lazy(() => import('@/features/username')),
  },
  {
    path: '/profile/:walletAddress',
    component: lazy(() => import('@/features/profile')),
  },
] as const
