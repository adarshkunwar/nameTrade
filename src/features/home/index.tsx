import Page from '@/components/ui/Page'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'
import TableData from './components/TableData'
import { TABLE_DATA } from './constant/table.const'

const Home = () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
    const data = TABLE_DATA[0]
    return {
      ...data,
      username: item + 1,
    }
  })

  return (
    <Page>
      <div className="">
        <section className="flex flex-col py-10 gap-5">
          <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />
        </section>
        <section className="py-2">
          <TableData data={data} />
        </section>
      </div>
    </Page>
  )
}

export default Home
