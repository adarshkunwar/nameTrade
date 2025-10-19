import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { useParams } from 'react-router-dom'

const Profile = () => {
  const { walletAddress: walletAddressParam } = useParams()

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-2">
          <Heading variant="h2" title={`Profile of ${walletAddressParam}`} color="white" fontWeight={700} />
        </div>
      </div>
    </Page>
  )
}

export default Profile
