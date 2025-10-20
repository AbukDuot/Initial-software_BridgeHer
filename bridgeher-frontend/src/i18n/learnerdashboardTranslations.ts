export type LangKey = "en" | "ar";

type Sidebar = {
  dashboard: string;
  courses: string;
  mentorship: string;
  certificates: string;
  settings: string;
};

type Header = {
  welcome: string;
  sub: string;
  light: string;
  dark: string;
  soundOn: string;
  soundOff: string;
};

type Stats = {
  streak: string;
  xp: string;
  level: string;
};

type Analytics = {
  title: string;
  weekly: string;
  completion: string;
  completed: string;
  remaining: string;
};

type Reminders = {
  title: string;
  add: string;
  placeholder: string;
  done: string;
  remove: string;
  empty: string;
};

type Calendar = {
  title: string;
  desc: string;
  note: string;
};

type LearnerTranslations = {
  sidebar: Sidebar;
  header: Header;
  stats: Stats;
  analytics: Analytics;
  reminders: Reminders;
  calendar: Calendar;
  quotes: string[];
};

const learnerDashboardTranslations: Record<LangKey, LearnerTranslations> = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      courses: "Courses",
      mentorship: "Mentorship",
      certificates: "Certificates",
      settings: "Settings",
    },
    header: {
      welcome: "Welcome back,",
      sub: "Keep learning and growing with purpose.",
      light: "Light",
      dark: "Dark",
      soundOn: "Sound On",
      soundOff: "Sound Off",
    },
    stats: {
      streak: "Day Streak",
      xp: "XP Points",
      level: "Current Level",
    },
    analytics: {
      title: "Learning Analytics",
      weekly: "Weekly Learning Hours",
      completion: "Course Completion",
      completed: "Completed",
      remaining: "Remaining",
    },
    reminders: {
      title: "Reminders",
      add: "Add Reminder",
      placeholder: "Enter a new reminder...",
      done: "Done",
      remove: "Remove",
      empty: "No reminders yet - add one below!",
    },
    calendar: {
      title: "Your Google Calendar",
      desc: "View your upcoming sessions and course events.",
      note: "You can sync this calendar with your Google Account for automatic updates.",
    },
    quotes: [
      "Small steps every day lead to big change.",
      "Learning is a journey, not a race.",
      "Consistency beats intensity.",
      "Your future is built by what you do today.",
    ],
  },
  ar: {
    sidebar: {
      dashboard: "لوحة التحكم",
      courses: "الدورات",
      mentorship: "الإرشاد",
      certificates: "الشهادات",
      settings: "الإعدادات",
    },
    header: {
      welcome: "مرحباً بعودتكِ،",
      sub: "واصلي التعلم والنمو بثقة وتميّز.",
      light: "فاتح",
      dark: "داكن",
      soundOn: "الصوت مفعل",
      soundOff: "الصوت متوقف",
    },
    stats: {
      streak: "السلسلة المتتالية",
      xp: "نقاط الخبرة",
      level: "المستوى الحالي",
    },
    analytics: {
      title: "تحليلات التعلم",
      weekly: "ساعات التعلم الأسبوعية",
      completion: "معدل الإكمال",
      completed: "مكتمل",
      remaining: "متبقي",
    },
    reminders: {
      title: "التذكيرات",
      add: "إضافة تذكير",
      placeholder: "أدخل تذكيراً جديداً...",
      done: "تم",
      remove: "حذف",
      empty: "لا توجد تذكيرات بعد - أضيفي واحدة أدناه!",
    },
    calendar: {
      title: "التقويم الخاص بكِ",
      desc: "شاهدي مواعيد جلساتك ودوراتك.",
      note: "يمكنك ربط هذا التقويم بحسابك في Google لمزامنة الجلسات تلقائيًا.",
    },
    quotes: [
      "خطوة صغيرة كل يوم تصنع فرقًا كبيرًا.",
      "التعلُّم رحلة وليست سباقًا.",
      "الثبات يتفوق على الحِدّة.",
      "مستقبلك يُبنى بما تفعليه اليوم.",
    ],
  },
};

export default learnerDashboardTranslations;
