import Page from '@/components/ui/Page'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'
import Search from './components/search'

const Home = () => {
  const handleSearch = (data: { search: string }) => {
    console.log(data)
  }

  return (
    <Page>
      <div className="">
        <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />

        <Search submitFunction={handleSearch} />
      </div>
    </Page>
  )
}

export default Home
