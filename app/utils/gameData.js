import { getInfiniteTrainLevel } from './infiniteGameGenerator'

// Proxy array that generates items on demand for ANY level index (0 to 9999+)
function createInfiniteLevels(subject) {
  const cache = {}
  return new Proxy([], {
    get(target, prop) {
      if (prop === 'length') return 1000
      const idx = Number(prop)
      if (!isNaN(idx) && idx >= 0) {
        if (!cache[idx]) {
          cache[idx] = getInfiniteTrainLevel(subject, idx)
        }
        return cache[idx]
      }
      return target[prop]
    }
  })
}

export const arabicLevels = createInfiniteLevels('arabic')
export const englishLevels = createInfiniteLevels('english')
export const mathLevels = createInfiniteLevels('math')

export default {
  arabicLevels,
  englishLevels,
  mathLevels
}
