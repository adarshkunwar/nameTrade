import type { ProfileItemsListVariables } from '../types/query'
import type { ProfileItemsQueryOptions, IProfileItemsQueryBuilder } from '../hooks/useProfileItems'

export class ProfileItemsQueryBuilder implements IProfileItemsQueryBuilder {
  private readonly defaultVariables: Omit<ProfileItemsListVariables, 'address'> = {
    limit: 50,
    sort: {
      by: 'RECEIVED_DATE',
      direction: 'DESC',
    },
    filter: {
      collectionSlugs: ['basenames'],
    },
    cursor: null,
  }

  buildVariables(options: ProfileItemsQueryOptions & { cursor?: string | null }): ProfileItemsListVariables {
    return {
      address: options.address,
      limit: options.limit ?? this.defaultVariables.limit,
      sort: {
        by: options.sortBy ?? this.defaultVariables.sort.by,
        direction: options.sortDirection ?? this.defaultVariables.sort.direction,
      },
      filter: options.filter ?? this.defaultVariables.filter,
      cursor: options.cursor ?? null,
    }
  }

  buildQueryKey(options: ProfileItemsQueryOptions): readonly unknown[] {
    return [
      'profileItems',
      options.address,
      {
        limit: options.limit ?? this.defaultVariables.limit,
        sortBy: options.sortBy ?? this.defaultVariables.sort.by,
        sortDirection: options.sortDirection ?? this.defaultVariables.sort.direction,
        filter: options.filter ?? this.defaultVariables.filter,
      },
    ] as const
  }
}

export class ProfileItemsQueryBuilderFactory {
  static create(): IProfileItemsQueryBuilder {
    return new ProfileItemsQueryBuilder()
  }
}
