// ======================
//  الدوام الأسبوعي الموحد
// ======================
const unifiedTime =
"السبت: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الأحد: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الاثنين: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الثلاثاء: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الأربعاء: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الخميس: 8:00 صباحا - 2 ظهرا - 4 مساء - 8 مساء\n" +
"الجمعة: إجازة";


// ======================
//       بيانات الدكاترة
// ======================
const doctors = [
  {
    id:1,
    name:"د. عادل مبروك",
    specialty:"عرماء",
    hospital:"المافود",
    time: unifiedTime,
    phone:"776503890",
    bio:"استشاري ضحك بخبرة 12 سنة."
  },

  {
    id:2,
    name:"د. ماجد مبروك",
    specialty:"عرماء",
    hospital:"المافود",
    time: unifiedTime,
    phone:"776503890",
    bio:"استشاري ضحك بخبرة 12 سنة."
  },

  {id:3,name:"د. أحمد سالم",specialty:"أطفال",hospital:"مستشفى عتق",time: unifiedTime,phone:"776503891",bio:"طبيب أطفال و متابعة حديثي الولادة."},
  {id:4,name:"د. علي ناصر",specialty:"عظام",hospital:"مستشفى العاصمة",time: unifiedTime,phone:"776503892",bio:"جراح عظام و مفاصل."},
  {id:5,name:"د. سلمى حيدر",specialty:"نساء وتوليد",hospital:"مستشفى السلام",time: unifiedTime,phone:"776503893",bio:"أخصائية نساء وتوليد."},
  {id:6,name:"د. رامي الكندي",specialty:"أسنان",hospital:"مستوصف المدينة",time: unifiedTime,phone:"776503894",bio:"طبيب أسنان عام وتجميل."},
  {id:7,name:"د. نور الحسن",specialty:"جلدية",hospital:"مستشفى الشفاء",time: unifiedTime,phone:"776503895",bio:"أمراض جلدية وتجميلي."},
  {id:8,name:"د. سامي الحكيم",specialty:"قلبية",hospital:"المستشفى الأهلي",time: unifiedTime,phone:"776503896",bio:"استشاري قلب والشرايين."},
  {id:9,name:"د. فاطمة أحمد",specialty:"عيون",hospital:"مستشفى الحزم",time: unifiedTime,phone:"776503897",bio:"أخصائية عيون وتصحيح نظر."},
  {id:10,name:"د. كمال سيف",specialty:"أذن وأنف",hospital:"مستشفى السلام",time: unifiedTime,phone:"776503898",bio:"أخصائي أنف وأذن وحنجرة."},
  {id:11,name:"د. عبير منصور",specialty:"باطنية",hospital:"مستشفى شبوة",time: unifiedTime,phone:"776503899",bio:"متابعة حالات مزمنة."},
  {id:12,name:"د. مازن جلال",specialty:"مسالك",hospital:"مستشفى المدينة",time: unifiedTime,phone:"776503800",bio:"أمراض الكلى والمسالك."},
  {id:13,name:"د. هاجر رؤوف",specialty:"نفسي",hospital:"مستوصف الأمل",time: unifiedTime,phone:"776503801",bio:"طبيبة نفسية واستشارات."},
  {id:14,name:"د. رائد حسين",specialty:"جراحة عامة",hospital:"المستشفى الأهلي",time: unifiedTime,phone:"776503802",bio:"جراح عام وطوارئ."},
  {id:15,name:"د. لمى سعيد",specialty:"باطنية",hospital:"مستشفى الحزم",time: unifiedTime,phone:"776503803",bio:"أمراض داخلية ومتابعات."},
  {id:16,name:"د. نادر ياسين",specialty:"أطفال",hospital:"مستشفى شبوة",time: unifiedTime,phone:"776503804",bio:"طبيب أطفال ومناعة."},
  {id:17,name:"د. مها السعيد",specialty:"أسنان",hospital:"مستوصف الشفاء",time: unifiedTime,phone:"776503805",bio:"قوالب وتقويم وعمليات بسيطة."},
  {id:18,name:"د. غالب مراد",specialty:"أورام",hospital:"المستشفى الإقليمي",time: unifiedTime,phone:"776503806",bio:"أورام وعلاج كيميائي."},
  {id:19,name:"د. وردة علي",specialty:"جلدية",hospital:"مستشفى المدينة",time: unifiedTime,phone:"776503807",bio:"استشارات جلدية."},
  {id:20,name:"د. سامر نبيل",specialty:"أنف و أذن",hospital:"مستشفى شبوة",time: unifiedTime,phone:"776503808",bio:"أذن وحنجرة ومناظير."},
  {id:21,name:"د. هيفاء خالد",specialty:"نساء وتوليد",hospital:"مستشفى الشفاء",time: unifiedTime,phone:"776503809",bio:"مراقبة حمل وعمليات."}
];