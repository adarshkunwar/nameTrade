type TRoute = {
  path: string
  component: React.LazyExoticComponent<React.ComponentType<any>>
  children?: TRoute[]
  exact?: boolean
  pathname?: string
}

export type { TRoute }
