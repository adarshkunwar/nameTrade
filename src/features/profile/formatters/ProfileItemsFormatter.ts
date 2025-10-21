import formatProfileItem from '../lib/formatProfileItem'
import type { ProfileItem } from '../types/query'
import type { TProfileUsername } from '../types/profile'
import type { IProfileItemsFormatter } from '../hooks/useProfileItems'

export class ProfileItemsFormatter implements IProfileItemsFormatter {
  formatItems(items: ProfileItem[]): TProfileUsername[] {
    return items
      .map(formatProfileItem)
      .filter((item): item is TProfileUsername => item !== null)
  }
}

export class ProfileItemsFormatterFactory {
  static create(): IProfileItemsFormatter {
    return new ProfileItemsFormatter()
  }
}
