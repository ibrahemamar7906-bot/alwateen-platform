const fs = require('fs');
const file = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\page.js';
let content = fs.readFileSync(file, 'utf8');

const target = 
        let finalId = user.id;
                                    if (profile?.role === 'assistant') {
          const { data: link } = await supabase
            .from('assistant_links')
            .select('teacher_id')
            .eq('assistant_id', user.id)
            .eq('status', 'approved')
            .maybeSingle();
            
          if (link) {
            finalId = link.teacher_id;
          } else {
            router.push('/assistant-link');
            return;
          }
        } 
        setTeacher({
          id: finalId,
          role: profile.role,
          name: profile.full_name,
          phone: profile.phone || '',
          status: profile.status,
          subscription_end_date: profile.subscription_end_date,
          trial_status: profile.trial_status || 'none'
        })
;

const replacement = 
        let finalId = user.id;
        let subStatus = profile.status;
        let subEnd = profile.subscription_end_date;
        let trialStat = profile.trial_status || 'none';

        if (profile?.role === 'assistant') {
          const { data: link } = await supabase
            .from('assistant_links')
            .select('teacher_id')
            .eq('assistant_id', user.id)
            .eq('status', 'approved')
            .maybeSingle();
            
          if (link) {
            finalId = link.teacher_id;
            // Fetch teacher's subscription
            const { data: teacherProfile } = await supabase
              .from('profiles')
              .select('status, subscription_end_date, trial_status')
              .eq('id', finalId)
              .single();
              
            if (teacherProfile) {
              subStatus = teacherProfile.status;
              subEnd = teacherProfile.subscription_end_date;
              trialStat = teacherProfile.trial_status || 'none';
            }
          } else {
            router.push('/assistant-link');
            return;
          }
        } 

        setTeacher({
          id: finalId,
          role: profile.role, // keeping assistant's role so we know they are assistant
          name: profile.full_name,
          phone: profile.phone || '',
          status: subStatus,
          subscription_end_date: subEnd,
          trial_status: trialStat
        })
;

// It seems there's some whitespace mess. I will use regex in PS instead.