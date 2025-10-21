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

const Home = () => {
  const navigate = useNavigate()
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
    const data = TABLE_DATA[0]
    return {
      ...data,
      username: item + 1,
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
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

  const handleResultSelect = useCallback(
    (result: TUsername) => {
      setSearchTerm('')
      navigate(`/username/${result.tokenId}`, {
        state: {
          username: result.username,
        },
      })
    },
    [navigate]
  )

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
