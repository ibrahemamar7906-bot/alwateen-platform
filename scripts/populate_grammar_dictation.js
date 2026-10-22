const fs = require('fs');
const path = require('path');

const basePath = path.join('E:', 'ملفات المنصة', '-', 'app', 'prep-1');

const grammarData = {
  'lesson-2': {
    title: 'الفعل المجرد والفعل المزيد',
    sections: [
      {
        heading: 'مفهوم المجرد والمزيد',
        text: 'الفعل المجرد هو ما كانت جميع حروفه أصلية، ولا يمكن الاستغناء عن أي حرف منها وإلا تغير المعنى. أما الفعل المزيد فهو ما زيد على حروفه الأصلية حرف أو أكثر.',
        examples: ['مجرد: كَتَبَ، دَحْرَجَ', 'مزيد: أَكْرَمَ، تَعَلَّمَ، اسْتَخْرَجَ']
      },
      {
        heading: 'أنواع الفعل المجرد',
        text: '١. مجرد ثلاثي (مثل: علم، فهم، ضرب).\n٢. مجرد رباعي (مثل: زلزل، وسوس، دحرج).',
        examples: []
      },
      {
        heading: 'أنواع الفعل المزيد',
        text: '١. مزيد ثلاثي: قد يكون مزيداً بحرف (مثل: أخرج، قاتل، علّم)، أو بحرفين (مثل: انكسر، انتصر، اخضر، تقدم، تشارك)، أو بثلاثة أحرف (مثل: استخرج).\n٢. مزيد رباعي: قد يكون مزيداً بحرف (مثل: تدحرج)، أو بحرفين (مثل: اطمأنّ).',
        examples: []
      }
    ]
  },
  'lesson-3': {
    title: 'أنواع الفعل الصحيح',
    sections: [
      {
        heading: 'مفهوم الفعل الصحيح',
        text: 'الفعل الصحيح هو ما خلت حروفه الأصلية من أحرف العلة (الألف، الواو، الياء).',
        examples: ['كتب، قرأ، شدّ']
      },
      {
        heading: 'أنواع الفعل الصحيح',
        text: '١. السالم: ما سلمت حروفه من الهمزة والتضعيف (مثل: شرب، لعب).\n٢. المهموز: ما كان أحد حروفه الأصلية همزة (مثل: أكل، سأل، قرأ).\n٣. المضعّف: نوعان، مضعف ثلاثي (مثل: مدّ، شدّ، عدّ) ومضعف رباعي (مثل: زلزل، عسعس).',
        examples: []
      }
    ]
  },
  'lesson-4': {
    title: 'أنواع الفعل المعتل',
    sections: [
      {
        heading: 'مفهوم الفعل المعتل',
        text: 'الفعل المعتل هو ما كان أحد حروفه الأصلية حرف علة (ا - و - ي).',
        examples: ['وعد، قال، سعى']
      },
      {
        heading: 'أنواع الفعل المعتل',
        text: '١. المثال: ما كان أوله حرف علة (مثل: وجد، يئس).\n٢. الأجوف: ما كان وسطه حرف علة (مثل: صام، باع).\n٣. الناقص: ما كان آخره حرف علة (مثل: دعا، قضى).\n٤. اللفيف: ما كان فيه حرفا علة، وهو نوعان: مفروق (مثل: وقى) ومقرون (مثل: شوى).',
        examples: []
      }
    ]
  },
  'lesson-5': {
    title: 'ظن وأخواتها',
    sections: [
      {
        heading: 'مفهوم ظن وأخواتها',
        text: 'هي أفعال ناسخة تدخل على الجملة الاسمية، فتنصب المبتدأ والخبر ليصبحا مفعولاً به أول ومفعولاً به ثانٍ.',
        examples: ['ظنّ الطالبُ الامتحانَ سهلاً. (الامتحان: مفعول به أول، سهلاً: مفعول به ثانٍ)']
      },
      {
        heading: 'تقسيم الأفعال من حيث المعنى',
        text: '١. أفعال الرجحان (الشك): ظنّ، حسب، زعم، خال.\n٢. أفعال اليقين: علم، وجد، رأى.\n٣. أفعال التحويل: جعل.',
        examples: ['رأيتُ الحقَّ واضحاً. (يقين)', 'حسبَ الكسولُ النجاحَ سهلاً. (رجحان)', 'جعلَ النجارُ الخشبَ كرسياً. (تحويل)']
      }
    ]
  }
};

const dictationData = {
  'lesson-1': {
    title: 'كتابة الهمزة على الألف',
    sections: [
      {
        heading: 'الهمزة في أول الكلمة (القطع والوصل)',
        text: 'همزة القطع تُكتب وتُنطق دائماً (مثل: أحمد، أكل). ألف الوصل تُنطق في بداية الكلام وتسقط في وصله ولا تُكتب فوقها همزة (مثل: ابن، استخراج).',
        examples: []
      },
      {
        heading: 'الهمزة المتوسطة على الألف',
        text: 'تُكتب الهمزة المتوسطة على الألف إذا كانت: مفتوحة وما قبلها مفتوح (سَأَل)، أو مفتوحة وما قبلها ساكن صحيح (مسْأَلة)، أو ساكنة وما قبلها مفتوح (فَأْس).',
        examples: []
      }
    ]
  },
  'lesson-2': {
    title: 'كتابة الهمزة على الواو',
    sections: [
      {
        heading: 'الهمزة المتوسطة على الواو',
        text: 'تُكتب على الواو إذا كانت حركة الهمزة أو الحرف الذي قبلها هي الضمة (والضمة أقوى من الفتحة والسكون).\\nمثل: مضمومة وما قبلها ساكن (مَسْؤُول)، ساكنة وما قبلها مضموم (مُؤْمن)، مفتوحة وما قبلها مضموم (مُؤَذن).',
        examples: ['تفاؤُل، شُؤُون، رُؤْية']
      }
    ]
  },
  'lesson-3': {
    title: 'كتابة الهمزة على الياء (النبرة)',
    sections: [
      {
        heading: 'الهمزة المتوسطة والمتطرفة على الياء',
        text: 'تُكتب على نبرة إذا كانت مكسورة أو ما قبلها مكسور (الكسرة أقوى الحركات).\\nمثل: مكسورة وما قبلها ساكن (عائِل)، ساكنة وما قبلها مكسور (بِئْر).',
        examples: ['مُطْمَئِن، بِئْس، شاطِئ']
      }
    ]
  },
  'writing-1': {
    title: 'التعبير: كتابة السيرة الذاتية',
    sections: [
      {
        heading: 'تعريف السيرة الذاتية',
        text: 'هي نص يكتبه الشخص عن نفسه ليحكي قصة حياته وينقل تجاربه وخبراته للآخرين. تُستخدم فيها ضمائر المتكلم (أنا، قمتُ، نشأتُ).',
        examples: []
      },
      {
        heading: 'عناصر السيرة الذاتية',
        text: '١. من أنا (الميلاد والنشأة والتعلّم).\\n٢. مواقف لا تُنسى (صعبة أو سعيدة).\\n٣. طموحي للمستقبل.',
        examples: []
      }
    ]
  },
  'writing-2': {
    title: 'التعبير: كتابة السيرة الغيرية',
    sections: [
      {
        heading: 'تعريف السيرة الغيرية',
        text: 'هي نص يكتبه المؤلف عن حياة شخص آخر بارز أو مؤثر، معتمداً على الحقائق التاريخية والأدلة. تُستخدم فيها ضمائر الغائب (هو، وُلد، نشأ).',
        examples: []
      },
      {
        heading: 'خطوات الكتابة',
        text: '١. المقدمة: فكرة عامة عن الشخصية وتميزها.\\n٢. الموضوع: النشأة، التعليم، أهم الإنجازات، العقبات التي واجهها.\\n٣. الخاتمة: رأي الكاتب والتأثير الذي تركته الشخصية.',
        examples: []
      }
    ]
  }
};

const getTemplate = (title, parentPath, sections) => {
  const sectionsHtml = sections.map(sec => `
    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
      <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.3rem' }}>${sec.heading}</h3>
      <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>${sec.text.replace(/\\n/g, '<br/>')}</p>
      ${sec.examples.length > 0 ? `
      <div style={{ background: '#ecfdf5', padding: '15px', borderRadius: '8px', marginTop: '15px', color: '#059669' }}>
        <strong>أمثلة:</strong>
        <ul style={{ paddingRight: '20px', marginTop: '10px', listStyleType: 'disc' }}>
          ${sec.examples.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>
  `).join('');

  return `'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'

export default function Lesson() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/${parentPath}" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>شرح الدرس</span>
              </div>
              <h1 className={styles.title}>${title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '20px', borderBottom: '2px solid #ecfdf5', paddingBottom: '10px' }}>
            <BookOpen style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'middle' }} />
            محتوى الدرس
          </h2>
          ${sectionsHtml}
        </div>
      </div>
    </div>
  )
}
`;
};

// Generate Grammar
for (const [id, data] of Object.entries(grammarData)) {
  const filePath = path.join(basePath, 'grammar', id, 'page.js');
  fs.writeFileSync(filePath, getTemplate(data.title, 'grammar', data.sections));
  console.log('Wrote', filePath);
}

// Generate Dictation
for (const [id, data] of Object.entries(dictationData)) {
  const filePath = path.join(basePath, 'dictation', id, 'page.js');
  fs.writeFileSync(filePath, getTemplate(data.title, 'dictation', data.sections));
  console.log('Wrote', filePath);
}
