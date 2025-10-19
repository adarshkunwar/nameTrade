import { useCallback, useState } from 'react'
import Title from './components/Title'
import { CONSTANTS } from './constant/data.const'
import Search from './components/Search'
import TableData from './components/TableData'
import { TABLE_DATA } from './constant/table.const'
import AllUsernamesTable from './components/AllUsernamesTable'
import Page from '@/components/ui/Page'
import { useCollectionItems, useSearchCollectionItems, type UsernameRow } from './hooks/useCollectionItems'

const Home = () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
    const data = TABLE_DATA[0]
    return {
      ...data,
      username: item + 1,
    }
  })

  const [activeTab, setActiveTab] = useState<'top-auctions' | 'all-usernames'>('top-auctions')
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

  const searchErrorMessage =
    searchError instanceof Error ? searchError.message : searchError ? 'Unknown error' : null

  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleResultSelect = useCallback((result: UsernameRow) => {
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('top-auctions')}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'top-auctions'
                    ? 'border-primary bg-primary text-white'
                    : 'border-transparent bg-header/60 text-secondary hover:border-primary hover:text-white'
                }`}
              >
                Top Auctions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all-usernames')}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'all-usernames'
                    ? 'border-primary bg-primary text-white'
                    : 'border-transparent bg-header/60 text-secondary hover:border-primary hover:text-white'
                }`}
              >
                All Usernames
              </button>
            </div>
            {activeTab === 'top-auctions' ? (
              <TableData data={data} />
            ) : (
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
            )}
          </div>
        </section>
      </div>
    </Page>
  )
}

export default Home
