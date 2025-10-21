import { COLLECTION_API } from '../api/collection.api'
import type { CollectionItemsListVariables } from '../types/query'
import type { ICollectionService } from '../hooks/useCollection'

// ===== SERVICE IMPLEMENTATION (Single Responsibility Principle) =====
export class CollectionService implements ICollectionService {
  async fetchCollectionItems(variables: CollectionItemsListVariables) {
    return await COLLECTION_API.fetchCollectionItems(variables)
  }
}

// ===== SINGLETONS =====
export const collectionService: ICollectionService = new CollectionService()
export const mockCollectionService: ICollectionService = new (class implements ICollectionService {
  async fetchCollectionItems(_variables: CollectionItemsListVariables) {
    return { items: [], nextPageCursor: null }
  }
})()
