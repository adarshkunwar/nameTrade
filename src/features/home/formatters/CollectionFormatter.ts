import formatCollectionItem from '../lib/formatCollectionItem'
import type { TUsername } from '../types/username'
import type { ICollectionFormatter } from '../hooks/useCollection'

// ===== FORMATTER (Single Responsibility Principle) =====
export class CollectionFormatter implements ICollectionFormatter {
  formatItems(items: any[]): TUsername[] {
    return items.map(formatCollectionItem)
  }
}

// ===== SINGLETON EXPORT =====
export const collectionFormatter: ICollectionFormatter = new CollectionFormatter()
