import { PROFILE_ITEMS_API } from '../api/profileItems.api'
import type { IProfileItemsService } from '../hooks/useProfileItems'
import type { TBaseUsernamesResponse } from '../types/basenames'

export class ProfileItemsService implements IProfileItemsService {
  async fetchProfileItems(address: string): Promise<TBaseUsernamesResponse> {
    return await PROFILE_ITEMS_API.fetchProfileItems(address)
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
  async fetchProfileItems(_address: string): Promise<TBaseUsernamesResponse> {
    return {
      data: [],
      has_more: false,
      next_page: '',
      total_count: 0,
    }
  }
}
