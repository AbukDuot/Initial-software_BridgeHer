export type LangKey = "English" | "Arabic";

type AboutTranslations = {
  title: string;
  intro1: string;
  intro2: string;
  intro3: string;
  missionTitle: string;
  missionText: string;
  valuesTitle: string;
  inclusivity: string;
  inclusivityDesc: string;
  integrity: string;
  integrityDesc: string;
  collaboration: string;
  collaborationDesc: string;
  innovation: string;
  innovationDesc: string;
  empowerment: string;
  empowermentDesc: string;
  goalsTitle: string;
  goals: {
    accessibility: string;
    accessibilityDesc: string;
    skills: string;
    skillsDesc: string;
    mentorship: string;
    mentorshipDesc: string;
    community: string;
    communityDesc: string;
    sustainability: string;
    sustainabilityDesc: string;
  };
  teamTitle: string;
  roles: {
    founder: string;
    advisor: string;
    mentorshipCoordinator: string;
    technicalLead: string;
    uiuxDesigner: string;
    communityEngagement: string;
    contentLead: string;
    trainingSpecialist: string;
  };
  bios: {
    abuk: string;
    priscilla: string;
    aguil: string;
    akoi: string;
    ajok: string;
    alek: string;
    dorcus: string;
    achol: string;
  };
};

const aboutTranslations: Record<LangKey, AboutTranslations> = {
  English: {
    title: "About Us",
    intro1: "BridgeHer is an inclusive digital learning and mentorship platform dedicated to empowering young women in South Sudan and beyond. Our mission is to break down barriers to education by offering offline-first, multilingual, and accessible tools for learning.",
    intro2: "We believe that when women gain access to knowledge and mentorship, they not only improve their own lives but also uplift their families and communities. BridgeHer provides practical courses in financial literacy, entrepreneurship, digital skills, and leadership, all designed to match the realities of low-connectivity environments.",
    intro3: "By combining innovative technology with a strong support system of mentors, educators, and partners, we are building a community where every learner has the opportunity to thrive, gain confidence, and become a leader of change.",
    missionTitle: "Our Mission",
    missionText: "To empower women by providing offline-first, inclusive, and engaging learning opportunities that combine financial literacy, entrepreneurship, digital skills, and mentorship.",
    valuesTitle: "Our Core Values",
    inclusivity: "Inclusivity",
    inclusivityDesc: "We welcome every learner and remove barriers to access.",
    integrity: "Integrity",
    integrityDesc: "We are transparent, honest, and accountable.",
    collaboration: "Collaboration",
    collaborationDesc: "Learners, mentors, and partners grow together.",
    innovation: "Innovation",
    innovationDesc: "We design offline-first, practical tech for real contexts.",
    empowerment: "Empowerment",
    empowermentDesc: "Skills that build confidence, income, and leadership.",
    goalsTitle: "Our Goals",
    goals: {
      accessibility: "Digital Accessibility",
      accessibilityDesc: "Make quality education accessible to women in remote areas through offline-capable technology.",
      skills: "Practical Skills Development",
      skillsDesc: "Provide comprehensive training in financial literacy, entrepreneurship, and digital skills.",
      mentorship: "Meaningful Mentorship",
      mentorshipDesc: "Connect learners with experienced mentors for guidance and career development.",
      community: "Supportive Community",
      communityDesc: "Build a network where women support each other's growth and success.",
      sustainability: "Economic Empowerment",
      sustainabilityDesc: "Enable women to achieve financial independence and become community leaders."
    },
    teamTitle: "Meet Our Team",
    roles: {
      founder: "Founder & Project Lead",
      advisor: "Advisor",
      mentorshipCoordinator: "Mentorship Coordinator",
      technicalLead: "Technical Lead",
      uiuxDesigner: "UI/UX Designer",
      communityEngagement: "Community Engagement Officer",
      contentLead: "Content Development Lead",
      trainingSpecialist: "Training & Evaluation Specialist",
    },
    bios: {
      abuk: "Abuk leads the vision and strategy of BridgeHer, ensuring every aspect of the project empowers young women to thrive.",
      priscilla: "Priscilla provides strategic guidance, drawing on her experience in women's empowerment and community development.",
      aguil: "Aguil designs and manages the mentorship program, connecting learners with experienced role models and mentors.",
      akoi: "Akoi leads the technical team, ensuring the platform is secure, scalable, and functional even in offline settings.",
      ajok: "Ajok designs user-friendly interfaces that make the platform accessible to users with different levels of digital literacy.",
      alek: "Alek builds relationships with communities and ensures that feedback from users is at the heart of BridgeHer's growth.",
      dorcus: "Dorcus curates and develops learning content in English and Arabic, making it practical and culturally relevant.",
      achol: "Achol evaluates training outcomes, monitors progress, and ensures that BridgeHer achieves real impact for learners.",
    },
  },
  Arabic: {
    title: "من نحن",
    intro1: "BridgeHer هي منصة تعليمية ورقمية شاملة مخصصة لتمكين الشابات في جنوب السودان وخارجها. مهمتنا هي كسر الحواجز أمام التعليم من خلال تقديم أدوات تعليمية متعددة اللغات وقابلة للاستخدام دون اتصال بالإنترنت.",
    intro2: "نؤمن بأنه عندما تحصل النساء على المعرفة والإرشاد، فإنهن لا يحسّنّ حياتهن فحسب، بل يرفعن أيضًا من مستوى أسرهن ومجتمعاتهن. توفر BridgeHer دورات عملية في الثقافة المالية وريادة الأعمال والمهارات الرقمية والقيادة، وكلها مصممة لتتناسب مع واقع البيئات ذات الاتصال المنخفض.",
    intro3: "من خلال الجمع بين التكنولوجيا المبتكرة ونظام دعم قوي من الموجهين والمعلمين والشركاء، نبني مجتمعًا حيث تتاح لكل متعلمة الفرصة للازدهار واكتساب الثقة وأن تصبح قائدة للتغيير.",
    missionTitle: "مهمتنا",
    missionText: "تمكين النساء من خلال توفير فرص تعليمية شاملة وجذابة تعمل دون اتصال بالإنترنت وتجمع بين الثقافة المالية وريادة الأعمال والمهارات الرقمية والإرشاد.",
    valuesTitle: "قيمنا الأساسية",
    inclusivity: "الشمولية",
    inclusivityDesc: "نرحب بكل متعلمة ونزيل الحواجز أمام الوصول.",
    integrity: "النزاهة",
    integrityDesc: "نحن شفافون وصادقون ومسؤولون.",
    collaboration: "التعاون",
    collaborationDesc: "المتعلمات والموجهون والشركاء ينمون معًا.",
    innovation: "الابتكار",
    innovationDesc: "نصمم تقنيات عملية تعمل دون اتصال بالإنترنت للسياقات الحقيقية.",
    empowerment: "التمكين",
    empowermentDesc: "مهارات تبني الثقة والدخل والقيادة.",
    goalsTitle: "أهدافنا",
    goals: {
      accessibility: "إمكانية الوصول الرقمي",
      accessibilityDesc: "جعل التعليم الجيد في متناول النساء في المناطق النائية من خلال التكنولوجيا التي تعمل دون اتصال بالإنترنت.",
      skills: "تطوير المهارات العملية",
      skillsDesc: "توفير تدريب شامل في الثقافة المالية وريادة الأعمال والمهارات الرقمية.",
      mentorship: "الإرشاد الهادف",
      mentorshipDesc: "ربط المتعلمات بالموجهين ذوي الخبرة للحصول على التوجيه والتطوير المهني.",
      community: "مجتمع داعم",
      communityDesc: "بناء شبكة حيث تدعم النساء نمو ونجاح بعضهن البعض.",
      sustainability: "التمكين الاقتصادي",
      sustainabilityDesc: "تمكين النساء من تحقيق الاستقلال المالي وأن يصبحن قائدات في المجتمع."
    },
    teamTitle: "تعرفي على فريقنا",
    roles: {
      founder: "المؤسسة وقائدة المشروع",
      advisor: "مستشارة",
      mentorshipCoordinator: "منسقة الإرشاد",
      technicalLead: "قائدة التقنية",
      uiuxDesigner: "مصممة واجهة المستخدم",
      communityEngagement: "مسؤولة التواصل المجتمعي",
      contentLead: "قائدة تطوير المحتوى",
      trainingSpecialist: "أخصائية التدريب والتقييم",
    },
    bios: {
      abuk: "تقود أبوك رؤية واستراتيجية BridgeHer، وتضمن أن كل جانب من جوانب المشروع يمكّن الشابات من الازدهار.",
      priscilla: "تقدم بريسيلا التوجيه الاستراتيجي، مستفيدة من خبرتها في تمكين المرأة والتنمية المجتمعية.",
      aguil: "تصمم أغويل وتدير برنامج الإرشاد، وتربط المتعلمات بالقدوات والموجهين ذوي الخبرة.",
      akoi: "تقود أكوي الفريق التقني، وتضمن أن المنصة آمنة وقابلة للتوسع وتعمل حتى في الإعدادات دون اتصال بالإنترنت.",
      ajok: "تصمم أجوك واجهات سهلة الاستخدام تجعل المنصة في متناول المستخدمين بمستويات مختلفة من المعرفة الرقمية.",
      alek: "يبني أليك علاقات مع المجتمعات ويضمن أن تكون ملاحظات المستخدمين في قلب نمو BridgeHer.",
      dorcus: "تقوم دوركس بتنظيم وتطوير محتوى التعلم باللغتين الإنجليزية والعربية، مما يجعله عمليًا وذا صلة ثقافية.",
      achol: "تقيّم أتشول نتائج التدريب وتراقب التقدم وتضمن أن BridgeHer تحقق تأثيرًا حقيقيًا للمتعلمات.",
    },
  },
};

export default aboutTranslations;
