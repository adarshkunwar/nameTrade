import { PROFILE_ITEMS_API } from '../api/profileItems.api'
import type { ProfileItemsListVariables } from '../types/query'
import type { IProfileItemsService } from '../hooks/useProfileItems'

export class ProfileItemsService implements IProfileItemsService {
  async fetchProfileItems(variables: ProfileItemsListVariables) {
    return await PROFILE_ITEMS_API.fetchProfileItems(variables)
  }
}

export class ProfileItemsServiceFactory {
  static create(): IProfileItemsService {
    return new ProfileItemsService()
  }

  static createWithMock(): IProfileItemsService {
    return new MockProfileItemsService()
  }
}

class MockProfileItemsService implements IProfileItemsService {
  async fetchProfileItems(_variables: ProfileItemsListVariables) {
    return {
      items: [],
      nextPageCursor: null,
    }
  }
}
