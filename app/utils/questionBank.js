import { getInfiniteQuestion } from './infiniteGameGenerator'

/**
 * Enhanced Educational Question Bank
 * Provides infinite procedural questions for Mario, Subway, Tank Battle and Classroom games.
 */
export const getEducationalQuestion = (subject, level = 1) => {
  return getInfiniteQuestion(subject, level)
}

export default getEducationalQuestion
