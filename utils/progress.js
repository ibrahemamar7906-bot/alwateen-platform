import { supabase } from './supabase'

/**
 * Updates the student's points and level in the database.
 * @param {string} userId - The Supabase user ID
 * @param {number} pointsToAdd - The points earned from the game/lesson
 * @returns {object} { success, newPoints, newLevel, error }
 */
export const updateStudentScore = async (userId, pointsToAdd) => {
  try {
    // SECURITY: Use Supabase RPC (Edge Function) instead of client-side update
    // This prevents malicious users from injecting millions of points via browser console.
    const { data, error } = await supabase.rpc('add_student_points', {
      p_user_id: userId,
      p_points_to_add: pointsToAdd
    })

    if (error) {
      // If the function doesn't exist yet (PGRST202 / 42883), suppress the console error silently.
      if (error.code === 'PGRST202' || error.code === '42883' || error.message?.includes('Could not find')) {
        return { success: false, missing_rpc: true }
      }
      throw error
    }

    // The RPC returns { success, newPoints, newLevel }
    return data
  } catch (error) {
    console.error('Error updating student score via RPC:', error.message || error)
    return { success: false, error }
  }
}

/**
 * Gets student streak, XP, and claimed chest rewards.
 * @param {string} userId
 */
export const getStudentGamificationData = async (userId) => {
  const fallback = {
    streak: 1,
    xp: 150,
    claimedChests: [],
    lastActiveDate: new Date().toISOString().split('T')[0]
  }

  try {
    if (!userId) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('guest_gamification')
        return local ? JSON.parse(local) : fallback
      }
      return fallback
    }

    const { data: { user } } = await supabase.auth.getUser()
    const meta = user?.user_metadata || {}

    return {
      streak: meta.streak_count || 1,
      xp: meta.xp_points || 150,
      claimedChests: meta.claimed_chests || [],
      lastActiveDate: meta.last_active_date || new Date().toISOString().split('T')[0]
    }
  } catch (err) {
    console.error('Error getting gamification data:', err)
    return fallback
  }
}

/**
 * Updates student daily streak and adds XP points.
 * @param {string} userId
 * @param {number} xpToAdd
 */
export const recordStudentActivityAndXP = async (userId, xpToAdd = 20) => {
  const todayStr = new Date().toISOString().split('T')[0]
  
  try {
    if (!userId) {
      if (typeof window !== 'undefined') {
        const current = await getStudentGamificationData(null)
        const lastDate = current.lastActiveDate
        let newStreak = current.streak || 1

        if (lastDate !== todayStr) {
          const diffDays = Math.round((new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
          if (diffDays === 1) {
            newStreak += 1
          } else if (diffDays > 1) {
            newStreak = 1
          }
        }

        const updated = {
          streak: newStreak,
          xp: (current.xp || 0) + xpToAdd,
          claimedChests: current.claimedChests || [],
          lastActiveDate: todayStr
        }
        localStorage.setItem('guest_gamification', JSON.stringify(updated))
        return { success: true, ...updated }
      }
      return { success: false }
    }

    const { data: { user } } = await supabase.auth.getUser()
    const meta = user?.user_metadata || {}
    const lastDate = meta.last_active_date || todayStr
    let newStreak = meta.streak_count || 1

    if (lastDate !== todayStr) {
      const diffDays = Math.round((new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        newStreak += 1
      } else if (diffDays > 1) {
        newStreak = 1
      }
    }

    const newXP = (meta.xp_points || 100) + xpToAdd
    const updatedMeta = {
      ...meta,
      streak_count: newStreak,
      xp_points: newXP,
      last_active_date: todayStr
    }

    await supabase.auth.updateUser({ data: updatedMeta })
    
    // Also sync to profiles if points column exists
    await updateStudentScore(userId, xpToAdd)

    return {
      success: true,
      streak: newStreak,
      xp: newXP,
      lastActiveDate: todayStr
    }
  } catch (err) {
    console.error('Error recording student activity:', err)
    return { success: false, error: err }
  }
}

/**
 * Claims a mystery reward chest.
 * @param {string} userId
 * @param {string|number} chestId
 * @param {number} rewardXP
 * @param {string} badgeName
 */
export const claimChestReward = async (userId, chestId, rewardXP = 50, badgeName = 'بطل الوحدة 🏅') => {
  try {
    if (!userId) {
      if (typeof window !== 'undefined') {
        const current = await getStudentGamificationData(null)
        const claimed = current.claimedChests || []
        if (claimed.includes(chestId)) return { success: false, alreadyClaimed: true }
        
        claimed.push(chestId)
        const updated = {
          ...current,
          xp: (current.xp || 0) + rewardXP,
          claimedChests: claimed
        }
        localStorage.setItem('guest_gamification', JSON.stringify(updated))
        return { success: true, xp: updated.xp, badgeName }
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    const meta = user?.user_metadata || {}
    const claimed = meta.claimed_chests || []

    if (claimed.includes(chestId)) {
      return { success: false, alreadyClaimed: true }
    }

    claimed.push(chestId)
    const newXP = (meta.xp_points || 100) + rewardXP
    const badges = meta.earned_badges || []
    if (!badges.includes(badgeName)) badges.push(badgeName)

    const updatedMeta = {
      ...meta,
      claimed_chests: claimed,
      xp_points: newXP,
      earned_badges: badges
    }

    await supabase.auth.updateUser({ data: updatedMeta })
    await updateStudentScore(userId, rewardXP)

    return { success: true, xp: newXP, badgeName }
  } catch (err) {
    console.error('Error claiming chest reward:', err)
    return { success: false, error: err }
  }
}

/**
 * Logs a student's mistake for analytics.
 */
export const logStudentMistake = async (userId, gameName, mistakeItem) => {
  try {
    const { error } = await supabase
      .from('student_performance')
      .insert([
        {
          user_id: userId,
          game_name: gameName,
          mistake_item: mistakeItem,
          created_at: new Date().toISOString()
        }
      ])
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error logging student mistake:', error)
    return { success: false, error }
  }
}

/**
 * Gets student current pathway progress and list of completed node IDs.
 * Synchronized with Supabase user metadata and localStorage.
 */
export const getCompletedNodes = async (userId, subject) => {
  try {
    let completed = []

    if (userId) {
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      if (meta.completed_nodes && meta.completed_nodes[subject]) {
        completed = meta.completed_nodes[subject]
      } else if (meta.pathway_progress && meta.pathway_progress[subject]) {
        // Fallback: If only numeric max ID is stored
        const maxId = meta.pathway_progress[subject]
        for (let i = 1; i < maxId; i++) completed.push(i)
      }
    } else if (typeof window !== 'undefined') {
      const local = localStorage.getItem('pathway_completed_nodes')
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed[subject]) completed = parsed[subject]
      } else {
        const oldLocal = localStorage.getItem('pathway_progress')
        if (oldLocal) {
          const parsed = JSON.parse(oldLocal)
          const maxId = parsed[subject] || 1
          for (let i = 1; i < maxId; i++) completed.push(i)
        }
      }
    }

    return Array.from(new Set(completed))
  } catch (err) {
    console.error('Error getting completed nodes:', err)
    return []
  }
}

/**
 * Gets student current pathway progress node for a given subject.
 * Synchronized with Supabase user metadata and localStorage.
 */
export const getPathwayProgress = async (userId, subject) => {
  try {
    let progress = 1

    if (userId) {
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      if (meta.pathway_progress && meta.pathway_progress[subject]) {
        progress = meta.pathway_progress[subject]
      }
    } else if (typeof window !== 'undefined') {
      const local = localStorage.getItem('pathway_progress')
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed[subject]) progress = parsed[subject]
      }
    }

    return progress
  } catch (err) {
    console.error('Error getting pathway progress:', err)
    return 1
  }
}

/**
 * Saves pathway progress when a student completes a node.
 * Automatically awards XP and syncs to Supabase.
 */
export const savePathwayProgress = async (userId, subject, completedNodeId, xpBonus = 20) => {
  try {
    const nextNodeId = completedNodeId + 1

    // 1. Save locally for instant reactivity
    if (typeof window !== 'undefined') {
      // Save max progress
      const local = localStorage.getItem('pathway_progress')
      const parsed = local ? JSON.parse(local) : {}
      if (!parsed[subject] || nextNodeId > parsed[subject]) {
        parsed[subject] = nextNodeId
        localStorage.setItem('pathway_progress', JSON.stringify(parsed))
      }

      // Save completed nodes array
      const localComp = localStorage.getItem('pathway_completed_nodes')
      const parsedComp = localComp ? JSON.parse(localComp) : {}
      const setComp = new Set(parsedComp[subject] || [])
      setComp.add(completedNodeId)
      parsedComp[subject] = Array.from(setComp)
      localStorage.setItem('pathway_completed_nodes', JSON.stringify(parsedComp))
    }

    // 2. Sync to Supabase if authenticated
    if (userId) {
      const { data: { user } } = await supabase.auth.getUser()
      const meta = user?.user_metadata || {}
      const curProgress = meta.pathway_progress || {}
      const curCompleted = meta.completed_nodes || {}
      const setComp = new Set(curCompleted[subject] || [])
      setComp.add(completedNodeId)

      const updatedProgress = {
        ...curProgress,
        [subject]: Math.max(curProgress[subject] || 1, nextNodeId)
      }
      const updatedCompleted = {
        ...curCompleted,
        [subject]: Array.from(setComp)
      }

      await supabase.auth.updateUser({
        data: {
          pathway_progress: updatedProgress,
          completed_nodes: updatedCompleted
        }
      })

      // Record activity & reward XP in Supabase
      await recordStudentActivityAndXP(userId, xpBonus)
    } else {
      // Guest reward XP
      await recordStudentActivityAndXP(null, xpBonus)
    }

    return { success: true, nextNodeId }
  } catch (err) {
    console.error('Error saving pathway progress:', err)
    return { success: false, error: err }
  }
}

