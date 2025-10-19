import { useCallback, useState } from 'react'
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

const Home = () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
    const data = TABLE_DATA[0]
    return {
      ...data,
      username: item + 1,
    }
  })

  const [searchTerm, setSearchTerm] = useState('')

  const {
    rows: allUsernamesRows,
    isLoading: isAllUsernamesLoading,
    error: allUsernamesError,
    refetch: refetchAllUsernames,
    isRefetching: isAllUsernamesRefetching,
    fetchNextPage: fetchMoreAllUsernames,
    isFetchingNextPage: isAllUsernamesFetchingNext,
    hasMore: hasMoreAllUsernames,
  } = useCollectionItems({
    sortBy: 'PRICE',
    sortDirection: 'ASC',
    limit: 25,
  })

  const allUsernamesErrorMessage =
    allUsernamesError instanceof Error ? allUsernamesError.message : allUsernamesError ? 'Unknown error' : null

  const {
    rows: searchResults,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchCollectionItems({
    searchTerm,
    limit: 8,
    sortBy: 'CREATED_DATE',
    sortDirection: 'ASC',
  })

  const searchErrorMessage = searchError instanceof Error ? searchError.message : searchError ? 'Unknown error' : null

  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleResultSelect = useCallback((result: TUsername) => {
    setSearchTerm(result.username)
  }, [])

  const handleLoadMoreUsernames = useCallback(() => {
    if (hasMoreAllUsernames) {
      void fetchMoreAllUsernames()
    }
  }, [hasMoreAllUsernames, fetchMoreAllUsernames])

  return (
    <Page>
      <div className="">
        <section className="flex flex-col py-10 gap-5">
          <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />

          <Search
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchTermChange}
            results={searchResults}
            isLoading={isSearchLoading || isSearchFetching}
            error={searchErrorMessage}
            onResultSelect={handleResultSelect}
          />
        </section>

        <section className="py-6">
          <Tabs
            tabs={[
              { name: 'Top Auctions', field: <TableData data={data} /> },
              {
                name: 'All Usernames',
                field: (
                  <AllUsernamesTable
                    data={allUsernamesRows}
                    isLoading={isAllUsernamesLoading}
                    isRefetching={isAllUsernamesRefetching}
                    error={allUsernamesErrorMessage}
                    onRetry={refetchAllUsernames}
                    onLoadMore={hasMoreAllUsernames ? handleLoadMoreUsernames : undefined}
                    canLoadMore={hasMoreAllUsernames}
                    isFetchingNextPage={isAllUsernamesFetchingNext}
                  />
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
