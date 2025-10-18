import Page from '@/components/ui/Page'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'

const Home = () => {
  return (
    <Page>
      <div className="flex  justify-center  h-full">
        <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />
      </div>
    </Page>
  )
}

export default Home
