const fs = require('fs');
const path = require('path');

const basePath = path.join('E:', 'ملفات المنصة', '-', 'app', 'prep-1');

const readingData = {
  'lesson-2': {
    title: 'بطولات مصرية',
    sections: [
      {
        heading: 'محمد صلاح',
        text: 'نشأ في قرية "نجريج" بمحافظة الغربية. واجه صعوبات في بداية طريقه لكنه لم يستسلم. احترف في أوروبا وتنقل بين الأندية حتى أصبح نجماً في نادي المقاولون ثم ليفربول. توج بجوائز عديدة وصار أيقونة للشباب وقدوة لهم.',
        examples: ['القيمة المستفادة: الإصرار والتحدي يصنعان المعجزات.']
      },
      {
        heading: 'علي فرج',
        text: 'بطل مصر في الإسكواش. ولد في القاهرة ونجح في كلية الهندسة ثم تفرغ للرياضة. احتل المركز الأول في التصنيف العالمي للإسكواش، ويتميز بأخلاقه الرياضية العالية وتنظيمه لوقته ومهاراته العالية.',
        examples: ['القيمة المستفادة: الجمع بين التفوق العلمي والرياضي.']
      },
      {
        heading: 'أحمد الجندي',
        text: 'بطل الخماسي الحديث. حصد الميدالية الذهبية في أولمبياد باريس 2024. واجه تحديات صعبة لأن رياضته تتطلب خمس مهارات مختلفة ومجهوداً بدنياً عالياً، لكنه بالإرادة والصبر تغلب على المستحيل.',
        examples: ['القيمة المستفادة: الانضباط والتركيز يحققان الهدف.']
      }
    ]
  },
  'lesson-3': {
    title: 'وجه الوطن (شعر: فاروق جويدة)',
    sections: [
      {
        heading: 'التعريف بالشاعر',
        text: 'فاروق جويدة: شاعر مصري معاصر. وُلد بمحافظة كفر الشيخ عام 1946م. من أصوات الشعر الصادقة والمميزة في حركة الشعر العربي المعاصر. له أعمال ودواوين كثيرة.',
        examples: []
      },
      {
        heading: 'شرح الأبيات',
        text: 'البيت الأول: رسمنا حب مصر في القلوب كأنه وجه مشرق. \\nالبيت الثاني: يا مصر، سنظل نبني ونعمر ونحمي هذا الوطن جيلاً بعد جيل. \\nالبيت الثالث: أرض مصر عليها علامات البطولات والأمجاد التي حفرها الأجداد.',
        examples: ['مواطن الجمال: "وجه الوطن" - تصوير للوطن بإنسان له وجه مضيء.']
      }
    ]
  },
  'lesson-4': {
    title: 'تاريخنا.. أساس لمستقبلنا (المتحف المصري الكبير)',
    sections: [
      {
        heading: 'مشروع قومي ضخم',
        text: 'المتحف المصري الكبير هو مشروع قومي يعكس رؤية مصر في حماية التراث. لا يقتصر دوره على عرض الآثار فقط، بل هو مركز ثقافي وتعليمي.',
        examples: []
      },
      {
        heading: 'مكونات المتحف وأهميته',
        text: 'يضم المتحف قاعات عرض حديثة، ومراكز لترميم الآثار، ومتحفاً خاصاً للأطفال باستخدام التكنولوجيا والواقع الافتراضي. يعزز من السياحة ويحفظ تاريخ الأجداد لتتوارثه الأجيال.',
        examples: []
      }
    ]
  },
  'lesson-5': {
    title: 'دروس من الحياة',
    sections: [
      {
        heading: 'د. علي مصطفى مشرفة',
        text: 'وُلد بمحافظة دمياط، ونشأ في أسرة متعلمة. يُعد من أبرز علماء الرياضيات والفيزياء في العالم. أسهم في تقدم العلوم ورفض استخدام العلم في القتل والدمار.',
        examples: []
      },
      {
        heading: 'د. زكي مبارك',
        text: 'أديب مصري وُلد في قرية سنتريس. حفظ القرآن الكريم في الكتاب، والتحق بالأزهر، ثم حصل على الدكتوراه من السوربون، وكان كاتباً ومفكراً بارزاً.',
        examples: []
      },
      {
        heading: 'ناصيف اليازجي',
        text: 'أديب وشاعر لبناني، كان محباً للغة العربية، وقام بإحياء التراث العربي وترك مؤلفات عديدة في النحو واللغة والشعر.',
        examples: []
      }
    ]
  },
  'lesson-6': {
    title: 'شباب اليوم.. صناع الغد (شعر: إبراهيم ناجي)',
    sections: [
      {
        heading: 'التعريف بالشاعر',
        text: 'إبراهيم ناجي: طبيب وشاعر مصري. ولد بالقاهرة، وكان من مؤسسي مدرسة أبولو الشعرية. غلبت على أشعاره العاطفة وحب الوطن، وتوفي عام 1953م.',
        examples: []
      },
      {
        heading: 'الفكرة العامة للنص',
        text: 'يدعو الشاعر شباب مصر إلى النهوض والعمل الجاد من أجل بناء مستقبل مشرق للوطن، وتجاوز الصعوبات، لأن الشباب هم القوة الدافعة للتقدم.',
        examples: ['مواطن الجمال: "صناع الغد" تعبير يوحي بأهمية دور الشباب في بناء المستقبل.']
      }
    ]
  },
  'lesson-7': {
    title: 'رحمة تداوي وعلم يضيء (ابن النفيس)',
    sections: [
      {
        heading: 'نشأته وتعليمه',
        text: 'هو علاء الدين أبو الحسن، المعروف بابن النفيس. وُلد بدمشق، ونشأ في بيئة علمية. درس الطب واهتم بالتجربة والمشاهدة بدلاً من النقل الأعمى.',
        examples: []
      },
      {
        heading: 'أهم إنجازاته',
        text: 'يُعد المكتشف الأول للدورة الدموية الصغرى قبل الغرب بقرون. كان رئيس الأطباء في المستشفى المنصوري بالقاهرة. تميز بالرحمة والإنسانية في التعامل مع المرضى، وعالج الفقراء مجاناً.',
        examples: []
      }
    ]
  },
  'lesson-8': {
    title: 'إنسان في عصر التكنولوجيا',
    sections: [
      {
        heading: 'تأثير التكنولوجيا على الإنسان',
        text: 'شهد العالم تطوراً هائلاً في الأدوات التكنولوجية. أصبحت التكنولوجيا جزءاً لا يتجزأ من حياتنا، وأثرت على طريقة تفكيرنا وعلاقاتنا الاجتماعية.',
        examples: []
      },
      {
        heading: 'التوازن بين التقنية والإنسانية',
        text: 'يجب ألا نترك التكنولوجيا تسيطر على الجانب الإنساني والعاطفي. لا بد من تخصيص وقت للتواصل الحقيقي مع العائلة والأصدقاء، واستخدام التكنولوجيا بما يفيد المجتمع ولا يهدم القيم.',
        examples: []
      }
    ]
  },
  'lesson-9': {
    title: 'دعاء شاعرة (شعر: جليلة رضا)',
    sections: [
      {
        heading: 'التعريف بالشاعرة',
        text: 'جليلة رضا: شاعرة مصرية ولدت بالإسكندرية عام 1915م. لها عدة دواوين، وحصلت على جوائز في الشعر.',
        examples: []
      },
      {
        heading: 'شرح الأبيات',
        text: 'تتوجه الشاعرة إلى الله تعالى بالدعاء أن يعم السلام والأمان في الأرض، وأن تنتهي الحروب التي تدمر الإنسانية، وتدعو للطفل أن ينعم بحياة هادئة.',
        examples: ['مواطن الجمال: استخدام النداء "يا رب" يدل على التضرع واللجوء إلى الله.']
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
        <strong>أمثلة وملاحظات:</strong>
        <ul style={{ paddingRight: '20px', marginTop: '10px', listStyleType: 'disc' }}>
          ${sec.examples.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>
  `).join('');

  return `'use client'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
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
                <FileText size={18} />
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
            <FileText style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'middle' }} />
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

// Generate Reading and Texts
for (const [id, data] of Object.entries(readingData)) {
  const filePath = path.join(basePath, 'reading-and-texts', id, 'page.js');
  fs.writeFileSync(filePath, getTemplate(data.title, 'reading-and-texts', data.sections));
  console.log('Wrote', filePath);
}
