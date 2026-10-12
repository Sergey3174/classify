import type { CategoryId } from '../types'

/** With no category selected, delivery still applies to the goods in the feed. */
export function supportsDelivery(categoryId?: CategoryId) {
  return categoryId !== 'realty' && categoryId !== 'services' && categoryId !== 'jobs'
}