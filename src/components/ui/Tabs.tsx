import { useSearchParams } from 'react-router-dom'

type TabsProps = {
  name: string
  field: React.ReactNode
  key: string
}[]

export const Tabs = ({ tabs }: { tabs: TabsProps }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const activeTab = tabs.find((tab) => tab.key === mode)?.key ?? tabs[0]?.key

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-6 text-[26px] font-bold leading-[30px]"
        role="tablist"
        aria-label="Top auctions toggle"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            role="tab"
            tabIndex={0}
            onClick={() => {
              setSearchParams({ mode: tab.key })
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSearchParams({ mode: tab.key })
              }
            }}
            className={`cursor-pointer transition ${
              activeTab === tab.key ? 'text-white opacity-100' : 'text-white opacity-30 hover:opacity-60'
            }`}
          >
            {tab.name}
          </span>
        ))}
      </div>
      {tabs.find((tab) => tab.key === activeTab)?.field}
    </div>
  )
}
