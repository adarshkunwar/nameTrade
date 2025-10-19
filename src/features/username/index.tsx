import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { ENV } from '@/config/env'
import { useParams } from 'react-router-dom'
import HighestBid from './components/HighestBid'
import { BID_HISTORY_DATA, HIGHEST_BID_DATA } from './constant/table.const'
import BidHistory from './components/BidHistory'

const Profile = () => {
  const { username: usernameParam } = useParams()
  const suffix = ENV.VITE_SUFFIX

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-2">
          <Heading variant="h2" title={`${usernameParam}${suffix}`} color="white" fontWeight={700} />
        </div>

        <div>
          <HighestBid data={HIGHEST_BID_DATA} />
        </div>

        <div>
          <BidHistory data={BID_HISTORY_DATA} />
        </div>
      </div>
    </Page>
  )
}

export default Profile
