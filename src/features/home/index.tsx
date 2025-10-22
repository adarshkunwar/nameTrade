import { Tabs } from '@/components/ui/Tabs'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'
import Search from './components/search'
import TableData from './components/TableData'
import AllUsernamesTable from './components/AllUsernamesTable'
import Page from '@/components/ui/Page'

const Home = () => {
  return (
    <Page>
      <div>
        <section className="flex flex-col items-center gap-5 py-10">
          <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />

          <Search />
        </section>

        <section className="py-6">
          <Tabs
            tabs={[
              { name: 'Top Auctions', field: <TableData />, key: 'top+auctions' },
              {
                name: 'All Usernames',
                key: 'all+usernames',
                field: (
                  <div className="flex justify-center">
                    <AllUsernamesTable />
                  </div>
                ),
              },
            ]}
          />
        </section>
      </div>
    </Page>
  )
}

export default Home
