export type LangKey = "en" | "ar";

type AdminTranslations = {
  title: string;
  overview: string;
  totalUsers: string;
  totalCourses: string;
  totalMentors: string;
  activeLearners: string;
  userManagement: string;
  courseManagement: string;
  name: string;
  email: string;
  role: string;
  status: string;
  actions: string;
  titleCol: string;
  enrollments: string;
  edit: string;
  delete: string;
  addCourse: string;
  addUser: string;
  light: string;
  dark: string;
  soundOn: string;
  soundOff: string;
};

const adminDashboardTranslations: Record<LangKey, AdminTranslations> = {
  en: {
    title: "Admin Dashboard",
    overview: "Overview",
    totalUsers: "Total Users",
    totalCourses: "Total Courses",
    totalMentors: "Total Mentors",
    activeLearners: "Active Learners",
    userManagement: "User Management",
    courseManagement: "Course Management",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    actions: "Actions",
    titleCol: "Title",
    enrollments: "Enrollments",
    edit: "Edit",
    delete: "Delete",
    addCourse: "Add Course",
    addUser: "Add User",
    light: "Light",
    dark: "Dark",
    soundOn: "Sound On",
    soundOff: "Sound Off",
  },
  ar: {
    title: "لوحة تحكم المسؤول",
    overview: "نظرة عامة",
    totalUsers: "إجمالي المستخدمين",
    totalCourses: "إجمالي الدورات",
    totalMentors: "إجمالي المرشدين",
    activeLearners: "المتعلمون النشطون",
    userManagement: "إدارة المستخدمين",
    courseManagement: "إدارة الدورات",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    actions: "الإجراءات",
    titleCol: "العنوان",
    enrollments: "التسجيلات",
    edit: "تعديل",
    delete: "حذف",
    addCourse: "إضافة دورة",
    addUser: "إضافة مستخدم",
    light: "فاتح",
    dark: "داكن",
    soundOn: "الصوت مفعل",
    soundOff: "الصوت متوقف",
  },
};

export default adminDashboardTranslations;
