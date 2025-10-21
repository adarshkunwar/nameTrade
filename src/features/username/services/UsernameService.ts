import { USERNAME_ACTIVITY_QUERY_LIMIT, USERNAME_CHAIN_IDENTIFIER, USERNAME_CONTRACT_ADDRESS } from '../constant/config.const'
import { USERNAME_ACTIVITY_API } from '../api/usernameActivity.api'
import type { UsernameActivityVariables } from '../types/query'

export interface IUsernameService {
  fetchUsernameByTokenId(tokenId: string): Promise<string | null>
}

class UsernameService implements IUsernameService {
  async fetchUsernameByTokenId(tokenId: string): Promise<string | null> {
    const variables: UsernameActivityVariables = {
      identifier: {
        chain: USERNAME_CHAIN_IDENTIFIER,
        contractAddress: USERNAME_CONTRACT_ADDRESS,
        tokenId,
      },
      cursor: null,
      filter: null,
      limit: USERNAME_ACTIVITY_QUERY_LIMIT,
    }

    const activity = await USERNAME_ACTIVITY_API.fetchActivity(variables)
    const [firstItem] = activity?.items ?? []
    return firstItem?.item?.name ?? null
  }
}

class UsernameServiceFactory {
  static create(): IUsernameService {
    return new UsernameService()
  }
}

export const usernameService: IUsernameService = UsernameServiceFactory.create()
