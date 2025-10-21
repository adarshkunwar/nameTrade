import Heading from '@ui/Typography'
import Page from '../ui/Page'
import notFoundImage from '@/assets/img/error-404.png'
import { useNavigate } from 'react-router-dom'

const Page404 = () => {

  const navigate = useNavigate()

  return (
    <Page>
      <div className="flex flex-col gap-5 justify-center items-center h-screen">
        <img src={notFoundImage} alt="not found" className="w-1/2 h-1/2" />
        <Heading variant="h1" title="Page not found" color="white" />

        <button className="bg-secondary text-black px-4 py-2 rounded-md cursor-pointer" onClick={() => navigate('/')}>Go to Home</button>
      </div>
    </Page>
  )
}

export default Page404
