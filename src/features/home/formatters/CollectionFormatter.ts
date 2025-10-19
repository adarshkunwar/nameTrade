import formatCollectionItem from '../lib/formatCollectionItem'
import type { TUsername } from '../types/username'
import type { ICollectionFormatter } from '../hooks/useCollection'

// ===== FORMATTER (Single Responsibility Principle) =====
export class CollectionFormatter implements ICollectionFormatter {
  formatItems(items: any[]): TUsername[] {
    return items.map(formatCollectionItem)
  }
}

// ===== FACTORY FOR FORMATTER (Dependency Inversion Principle) =====
export class CollectionFormatterFactory {
  static create(): ICollectionFormatter {
    return new CollectionFormatter()
  }
}
