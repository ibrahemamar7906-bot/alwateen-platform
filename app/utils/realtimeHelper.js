/**
 * Safely removes a broadcast listener binding from a Supabase RealtimeChannel
 * without invoking channel.unsubscribe() which destroys the entire room connection.
 */
export function removeBroadcastBinding(channel, event, callback) {
  if (!channel) return
  try {
    if (channel.bindings && Array.isArray(channel.bindings.broadcast)) {
      const binding = channel.bindings.broadcast.find(b => {
        if (callback && b.callback === callback) return true
        if (event && b.filter?.event === event) return true
        return false
      })
      if (binding) {
        if (channel.channelAdapter && typeof channel.channelAdapter.off === 'function') {
          channel.channelAdapter.off('broadcast', binding.ref)
        }
        channel.bindings.broadcast = channel.bindings.broadcast.filter(b => b !== binding)
      }
    }
  } catch (e) {
    // safe fallback
  }
}

/**
 * Safely removes multiple broadcast bindings by callbacks or events.
 */
export function removeBroadcastBindings(channel, items = []) {
  if (!channel || !Array.isArray(items)) return
  items.forEach(item => {
    if (typeof item === 'function') {
      removeBroadcastBinding(channel, null, item)
    } else if (typeof item === 'string') {
      removeBroadcastBinding(channel, item, null)
    } else if (item && typeof item === 'object') {
      removeBroadcastBinding(channel, item.event, item.callback)
    }
  })
}
