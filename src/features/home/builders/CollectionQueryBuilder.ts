import type { CollectionItemsListVariables } from '../types/query'
import type { CollectionOptions, ICollectionQueryBuilder } from '../hooks/useCollection'

// ===== QUERY BUILDER (Single Responsibility Principle) =====
export class CollectionQueryBuilder implements ICollectionQueryBuilder {
  private readonly defaultVariables: CollectionItemsListVariables = {
    collectionSlug: 'basenames',
    limit: 50,
    sort: {
      by: 'PRICE',
      direction: 'ASC',
    },
  }

  buildVariables(options: CollectionOptions & { cursor?: string }): CollectionItemsListVariables {
    return {
      collectionSlug: options.collectionSlug ?? this.defaultVariables.collectionSlug,
      limit: options.limit ?? this.defaultVariables.limit,
      sort: {
        by: options.sortBy,
        direction: options.sortDirection,
      },
      filter: options.filter ?? null,
      address: options.address ?? null,
      cursor: options.cursor ?? null,
    }
  }

  buildQueryKey(options: CollectionOptions): readonly unknown[] {
    return [
      'collectionItems',
      'basenames',
      {
        sortBy: options.sortBy,
        sortDirection: options.sortDirection,
        limit: options.limit,
        filter: options.filter ?? null,
        collectionSlug: options.collectionSlug,
        address: options.address ?? null,
      },
    ] as const
  }
}

// ===== FACTORY FOR QUERY BUILDER (Dependency Inversion Principle) =====
export class CollectionQueryBuilderFactory {
  static create(): ICollectionQueryBuilder {
    return new CollectionQueryBuilder()
  }
}
