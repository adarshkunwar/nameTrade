import Header from './Header'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Header />
      <Outlet />
    </div>
  )
}

export default Layout
