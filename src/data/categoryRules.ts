import type { CategoryId } from '../types'

/** With no category selected, delivery still applies to the goods in the feed. */
export function supportsDelivery(categoryId?: CategoryId) {
  return categoryId !== 'realty' && categoryId !== 'services' && categoryId !== 'jobs'
}
/** Rental/sale choice is relevant to housing and transport, or the complete feed. */
export function supportsDealTypeFilter(categoryId?: CategoryId) {
  return !categoryId || categoryId === 'realty' || categoryId === 'transport'
}