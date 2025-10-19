import { COLLECTION_API } from '../api/collection.api'
import type { CollectionItemsListVariables } from '../types/query'
import type { ICollectionService } from '../hooks/useCollection'

// ===== SERVICE IMPLEMENTATION (Single Responsibility Principle) =====
export class CollectionService implements ICollectionService {
  async fetchCollectionItems(variables: CollectionItemsListVariables) {
    return await COLLECTION_API.fetchCollectionItems(variables)
  }
}

// ===== FACTORY PATTERN (Dependency Inversion Principle) =====
export class CollectionServiceFactory {
  static create(): ICollectionService {
    return new CollectionService()
  }

  static createWithMock(): ICollectionService {
    return new MockCollectionService()
  }
}

// ===== MOCK IMPLEMENTATION (Open/Closed Principle) =====
class MockCollectionService implements ICollectionService {
  async fetchCollectionItems(_variables: CollectionItemsListVariables) {
    // Mock implementation for testing
    return {
      items: [],
      nextPageCursor: null,
    }
  }
}
