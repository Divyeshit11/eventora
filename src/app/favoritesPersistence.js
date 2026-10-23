
import { selectFavoriteIds } from '../features/events/eventsSelectors'

export function setupFavoritesPersistence(store) {
  store.subscribe(() => {
    const favorites = selectFavoriteIds(store.getState())

    try {
      localStorage.setItem(
        'eventora-favorites',
        JSON.stringify(favorites)
      )
    } catch {
      // Browser storage may be unavailable.
    }
  })
}
