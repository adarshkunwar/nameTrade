import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '@/components/ui/Tabs'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'
import Search from './components/search'
import TableData from './components/TableData'
import { TABLE_DATA } from './constant/table.const'
import AllUsernamesTable from './components/AllUsernamesTable'
import Page from '@/components/ui/Page'
import { useCollectionItems, useSearchCollectionItems } from './hooks/useCollection'
import type { TUsername } from './types/username'
import { cryptic } from '@/lib/utils'

const Home = () => {
  const navigate = useNavigate()

  const [mintSortDirection, setMintSortDirection] = useState<'ASC' | 'DESC'>('DESC')

  const {
    rows: allUsernamesRows,
    isLoading: isAllUsernamesLoading,
    error: allUsernamesError,
    refetch: refetchAllUsernames,
    fetchNextPage: fetchMoreAllUsernames,
    isFetchingNextPage: isAllUsernamesFetchingNext,
    hasMore: hasMoreAllUsernames,
  } = useCollectionItems({
    sortBy: 'CREATED_DATE',
    sortDirection: mintSortDirection,
    limit: 25,
  })

  const allUsernamesErrorMessage =
    allUsernamesError instanceof Error ? allUsernamesError.message : allUsernamesError ? 'Unknown error' : null

  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
    const data = TABLE_DATA[0]
    return {
      ...data,
      username: item + 1,
    }
  })

  const handleLoadMoreUsernames = useCallback(() => {
    if (hasMoreAllUsernames) {
      void fetchMoreAllUsernames()
    }
  }, [hasMoreAllUsernames, fetchMoreAllUsernames])

  const handleToggleMintSort = useCallback(() => {
    setMintSortDirection((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
  }, [])

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
              { name: 'Top Auctions', field: <TableData data={data} />, key: 'top+auctions' },
              {
                name: 'All Usernames',
                key: 'all+usernames',
                field: (
                  <div className="flex justify-center">
                    <AllUsernamesTable
                      data={allUsernamesRows}
                      isLoading={isAllUsernamesLoading}
                      error={allUsernamesErrorMessage}
                      onRetry={refetchAllUsernames}
                      onLoadMore={hasMoreAllUsernames ? handleLoadMoreUsernames : undefined}
                      canLoadMore={hasMoreAllUsernames}
                      isFetchingNextPage={isAllUsernamesFetchingNext}
                      sortDirection={mintSortDirection}
                      onToggleSort={handleToggleMintSort}
                    />
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
