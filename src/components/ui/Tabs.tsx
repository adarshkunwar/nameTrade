import { useState } from 'react'

type TabsProps = {
  name: string
  field: React.ReactNode
}[]

export const Tabs = ({ tabs }: { tabs: TabsProps }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.name)

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-6 text-[26px] font-bold leading-[30px]"
        role="tablist"
        aria-label="Top auctions toggle"
      >
        {tabs.map((tab) => (
          <span
            key={tab.name}
            role="tab"
            tabIndex={0}
            aria-selected={activeTab === tab.name}
            onClick={() => setActiveTab(tab.name)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setActiveTab(tab.name)
              }
            }}
            className={`cursor-pointer transition ${
              activeTab === tab.name ? 'text-white opacity-100' : 'text-white opacity-30 hover:opacity-60'
            }`}
          >
            {tab.name}
          </span>
        ))}
      </div>
      {tabs.find((tab) => tab.name === activeTab)?.field}
    </div>
  )
}
