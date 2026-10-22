import sys

file_path = "app/teacher-assistant/live-components/LiveReadyPathway.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to add the listener for open_ready_lesson
new_effect = """
  useEffect(() => {
    if (!channel) return;
    
    // Listener for receiving lesson updates from teacher
    const sub = channel.on('broadcast', { event: 'open_ready_lesson' }, ({ payload }) => {
      if (payload) {
        setSelectedSubject(payload.subject || 'primary1_arabic');
        setActiveLesson(payload.lessonId);
      }
    });

    // Send sync if requested (only teacher)
    const handleSync = () => {
      if (isTeacher && activeLesson) {
        channel.send({
          type: 'broadcast',
          event: 'open_ready_lesson',
          payload: { lessonId: activeLesson, subject: selectedSubject }
        }).catch(() => {});
      }
    };
    
    window.addEventListener('on_global_sync_request', handleSync);
    
    return () => {
      window.removeEventListener('on_global_sync_request', handleSync);
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    };
  }, [channel, isTeacher, activeLesson, selectedSubject]);
"""

# Replace the existing useEffect
import re
content = re.sub(r'  useEffect\(\(\) => \{\s*if \(!channel \|\| !isTeacher\) return;.*?\s*\}, \[channel, isTeacher, activeLesson, selectedSubject\]\)', new_effect.strip('\n'), content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated LiveReadyPathway")
