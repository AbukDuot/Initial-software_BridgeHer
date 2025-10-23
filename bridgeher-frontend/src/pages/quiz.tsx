import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import "../styles/quiz.css";

interface Question {
  id: string;
  textEn: string;
  textAr: string;
  optionsEn: string[]; 
  optionsAr: string[]; 
  correctIndex: number; 
}

interface QuizBank {
  [courseId: string]: Question[];
}

interface PersistCourse {
  id: string;
  titleEn: string;
  titleAr: string;
  totalModules: number;
  completedModules: number;
  xp: number;
}

interface PersistShape {
  courses: PersistCourse[];
  xp: number;
  streak: number;
  lastActive: string; 
  unlockedSkills: string[];
  achievements: string[];
 
  quizResults?: Record<
    string,
    { lastScore: number; attempts: number; lastAt: string }
  >;
}


const STORAGE_KEY = "bh-learner-dashboard-v1";

function loadState(): PersistShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function saveState(s: PersistShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}


const T = {
  pageTitle: { English: "Course Quiz", Arabic: "اختبار الدورة" },
  timeLeft: { English: "Time left", Arabic: "الوقت المتبقي" },
  question: { English: "Question", Arabic: "السؤال" },
  of: { English: "of", Arabic: "من" },
  next: { English: "Next", Arabic: "التالي" },
  prev: { English: "Previous", Arabic: "السابق" },
  submit: { English: "Submit Quiz", Arabic: "إرسال الاختبار" },
  confirmSubmitTitle: {
    English: "Submit Quiz?",
    Arabic: "إرسال الاختبار؟",
  },
  confirmSubmitBody: {
    English:
      "Are you sure you want to submit? You won't be able to change your answers afterward.",
    Arabic:
      "هل أنت متأكدة من الإرسال؟ لن تتمكني من تعديل إجاباتك بعد ذلك.",
  },
  cancel: { English: "Cancel", Arabic: "إلغاء" },
  confirm: { English: "Confirm", Arabic: "تأكيد" },
  resultsTitle: { English: "Your Result", Arabic: "نتيجتك" },
  score: { English: "Score", Arabic: "النتيجة" },
  answersSaved: {
    English: "Your result has been saved.",
    Arabic: "تم حفظ نتيجتك.",
  },
  retake: { English: "Retake", Arabic: "إعادة المحاولة" },
  backToCourse: { English: "Back to Course", Arabic: "العودة إلى الدورة" },
  backToDashboard: {
    English: "Back to Dashboard",
    Arabic: "العودة إلى لوحة المتعلم",
  },
  correct: { English: "Correct", Arabic: "صحيح" },
  incorrect: { English: "Incorrect", Arabic: "غير صحيح" },
  explanation: { English: "Explanation", Arabic: "التفسير" },
};


const BANK: QuizBank = {
  "1": [
    {
      id: "1-1",
      textEn: "What is a budget primarily used for?",
      textAr: "ما هو الهدف الأساسي من إعداد الميزانية؟",
      optionsEn: [
        "To track income and expenses",
        "To increase bank fees",
        "To avoid all spending",
        "To set loan interest rates",
      ],
      optionsAr: [
        "لتتبع الدخل والمصروفات",
        "لزيادة رسوم البنك",
        "لتجنب أي إنفاق",
        "لتحديد أسعار الفائدة على القروض",
      ],
      correctIndex: 0,
    },
    {
      id: "1-2",
      textEn: "An emergency fund ideally covers how many months of expenses?",
      textAr: "صندوق الطوارئ يفضل أن يغطي كم شهراً من المصروفات؟",
      optionsEn: ["1–2 months", "3–6 months", "12 months", "No need"],
      optionsAr: ["1–2 شهر", "3–6 أشهر", "12 شهراً", "لا حاجة"],
      correctIndex: 1,
    },
    {
      id: "1-3",
      textEn: "Which expense is a fixed cost?",
      textAr: "أي المصروفات تُعد تكلفة ثابتة؟",
      optionsEn: ["Rent", "Food", "Transport fuel", "Data bundles"],
      optionsAr: ["الإيجار", "الطعام", "وقود المواصلات", "باقات الإنترنت"],
      correctIndex: 0,
    },
    {
      id: "1-4",
      textEn: "Saving a portion of income regularly is best done by:",
      textAr: "أفضل طريقة للادخار من الدخل بانتظام هي:",
      optionsEn: [
        "Saving last",
        "Automatic transfers",
        "Borrowing to save",
        "Ignoring expenses",
      ],
      optionsAr: [
        "الادخار في النهاية",
        "التحويلات التلقائية",
        "الاقتراض للادخار",
        "تجاهل المصروفات",
      ],
      correctIndex: 1,
    },
    {
      id: "1-5",
      textEn: "Which is an example of a SMART goal?",
      textAr: "أي مما يلي مثال لهدف ذكي (SMART)؟",
      optionsEn: [
        "Save money",
        "Start a business soon",
        "Save $200 in 3 months",
        "Spend less sometimes",
      ],
      optionsAr: [
        "الادخار",
        "بدء مشروع قريباً",
        "ادخار 200 دولار خلال 3 أشهر",
        "الإنفاق أقل في بعض الأحيان",
      ],
      correctIndex: 2,
    },
    {
      id: "1-6",
      textEn: "Financial literacy helps you to:",
      textAr: "الثقافة المالية تساعدك على:",
      optionsEn: [
        "Spend impulsively",
        "Make informed choices",
        "Ignore budgets",
        "Avoid all banks",
      ],
      optionsAr: [
        "الإنفاق دون تخطيط",
        "اتخاذ قرارات واعية",
        "تجاهل الميزانيات",
        "تجنب جميع البنوك",
      ],
      correctIndex: 1,
    },
    {
      id: "1-7",
      textEn: "Which is a common budgeting method?",
      textAr: "أي مما يلي أسلوب شائع لإعداد الميزانية؟",
      optionsEn: ["20/80", "50/30/20", "90/5/5", "60/20/30"],
      optionsAr: ["20/80", "50/30/20", "90/5/5", "60/20/30"],
      correctIndex: 1,
    },
    {
      id: "1-8",
      textEn: "Interest on savings is:",
      textAr: "الفائدة على المدخرات هي:",
      optionsEn: [
        "Fee charged to you",
        "Money earned on your balance",
        "A penalty",
        "Tax refund",
      ],
      optionsAr: [
        "رسوم تُفرض عليك",
        "أموال تُكتسب على رصيدك",
        "غرامة",
        "استرداد ضريبي",
      ],
      correctIndex: 1,
    },
    {
      id: "1-9",
      textEn: "Which helps reduce debt faster?",
      textAr: "ما الذي يساعد على سداد الديون بشكل أسرع؟",
      optionsEn: [
        "Paying minimum only",
        "Ignoring due dates",
        "Making extra payments",
        "Taking new loans",
      ],
      optionsAr: [
        "دفع الحد الأدنى فقط",
        "تجاهل مواعيد الاستحقاق",
        "إجراء دفعات إضافية",
        "أخذ قروض جديدة",
      ],
      correctIndex: 2,
    },
    {
      id: "1-10",
      textEn: "A side hustle can help you:",
      textAr: "العمل الجانبي يمكن أن يساعدك على:",
      optionsEn: [
        "Increase income",
        "Skip budgeting",
        "Stop saving",
        "Spend more",
      ],
      optionsAr: ["زيادة الدخل", "تجاهل الميزانية", "إيقاف الادخار", "الإنفاق أكثر"],
      correctIndex: 0,
    },
    {
      id: "1-11",
      textEn: "Which document tracks all income and expenses?",
      textAr: "أي مستند يتتبع جميع الدخل والمصروفات؟",
      optionsEn: ["Invoice", "Ledger", "Resume", "Passport"],
      optionsAr: ["فاتورة", "دفتر الأستاذ", "سيرة ذاتية", "جواز سفر"],
      correctIndex: 1,
    },
    {
      id: "1-12",
      textEn: "Cash flow means:",
      textAr: "التدفق النقدي يعني:",
      optionsEn: [
        "Only savings growth",
        "Money coming in and out",
        "Loans only",
        "Expenses only",
      ],
      optionsAr: [
        "زيادة المدخرات فقط",
        "الدخول والخروج للأموال",
        "القروض فقط",
        "المصروفات فقط",
      ],
      correctIndex: 1,
    },
    {
      id: "1-13",
      textEn: "Micro-savings work best when:",
      textAr: "الادخار الصغير يعمل بشكل أفضل عندما:",
      optionsEn: [
        "Irregular and random",
        "Automatic and frequent",
        "Large and rare",
        "Hidden and unknown",
      ],
      optionsAr: [
        "غير منتظم وعشوائي",
        "تلقائي ومتكرر",
        "كبير ونادر",
        "مخفي وغير معروف",
      ],
      correctIndex: 1,
    },
    {
      id: "1-14",
      textEn: "A realistic budget should be:",
      textAr: "يجب أن تكون الميزانية الواقعية:",
      optionsEn: ["Rigid", "Flexible", "Secret", "Unlimited"],
      optionsAr: ["صارمة", "مرنة", "سرية", "غير محدودة"],
      correctIndex: 1,
    },
    {
      id: "1-15",
      textEn: "Tracking expenses helps you:",
      textAr: "تتبع المصروفات يساعدك على:",
      optionsEn: [
        "See spending patterns",
        "Lose money",
        "Forget bills",
        "Increase fees",
      ],
      optionsAr: [
        "رؤية أنماط الإنفاق",
        "خسارة المال",
        "نسيان الفواتير",
        "زيادة الرسوم",
      ],
      correctIndex: 0,
    },
  ],
  "2": [
    {
      id: "2-1",
      textEn: "Digital leadership means:",
      textAr: "تعني القيادة الرقمية:",
      optionsEn: [
        "Avoiding technology",
        "Using digital tools to lead change",
        "Only coding skills",
        "Paper-based planning",
      ],
      optionsAr: [
        "تجنب التكنولوجيا",
        "استخدام الأدوات الرقمية لقيادة التغيير",
        "مهارات البرمجة فقط",
        "التخطيط الورقي",
      ],
      correctIndex: 1,
    },
    {
      id: "2-2",
      textEn: "Which improves online collaboration?",
      textAr: "ما الذي يحسن التعاون عبر الإنترنت؟",
      optionsEn: ["Clear roles", "No meetings", "Ignoring feedback", "Solo work"],
      optionsAr: ["أدوار واضحة", "بدون اجتماعات", "تجاهل الملاحظات", "العمل الفردي"],
      correctIndex: 0,
    },
    {
      id: "2-3",
      textEn: "A digital footprint is:",
      textAr: "البصمة الرقمية هي:",
      optionsEn: [
        "Online traces you leave",
        "Only your password",
        "A printed report",
        "Signature on paper",
      ],
      optionsAr: [
        "الآثار التي تتركها عبر الإنترنت",
        "كلمة المرور فقط",
        "تقرير مطبوع",
        "توقيع على ورق",
      ],
      correctIndex: 0,
    },
    {
      id: "2-4",
      textEn: "Two-factor authentication adds:",
      textAr: "المصادقة الثنائية تضيف:",
      optionsEn: [
        "More ads",
        "Extra security",
        "Longer usernames",
        "Slower internet",
      ],
      optionsAr: ["إعلانات أكثر", "أماناً إضافياً", "أسماء مستخدمين أطول", "إنترنت أبطأ"],
      correctIndex: 1,
    },
    {
      id: "2-5",
      textEn: "Effective online teams need:",
      textAr: "الفرق الفعّالة عبر الإنترنت تحتاج إلى:",
      optionsEn: ["Silence", "Shared goals", "Random tasks", "Hiding progress"],
      optionsAr: ["الصمت", "أهداف مشتركة", "مهام عشوائية", "إخفاء التقدم"],
      correctIndex: 1,
    },
    {
      id: "2-6",
      textEn: "A strong password should be:",
      textAr: "يجب أن تكون كلمة المرور القوية:",
      optionsEn: ["Short", "Common", "Unique & long", "Same everywhere"],
      optionsAr: ["قصيرة", "شائعة", "فريدة وطويلة", "نفسها في كل مكان"],
      correctIndex: 2,
    },
    {
      id: "2-7",
      textEn: "Digital leaders encourage:",
      textAr: "القادة الرقميون يشجعون:",
      optionsEn: ["Learning & innovation", "Secrecy", "Isolation", "No tools"],
      optionsAr: ["التعلم والابتكار", "السرية", "العزلة", "بدون أدوات"],
      correctIndex: 0,
    },
    {
      id: "2-8",
      textEn: "Cloud tools help teams to:",
      textAr: "تساعد أدوات السحابة الفرق على:",
      optionsEn: [
        "Work together in real time",
        "Only store locally",
        "Avoid sharing",
        "Lose versions",
      ],
      optionsAr: [
        "العمل معاً في الوقت الفعلي",
        "التخزين محلياً فقط",
        "تجنب المشاركة",
        "فقدان الإصدارات",
      ],
      correctIndex: 0,
    },
    {
      id: "2-9",
      textEn: "Which is a good virtual meeting practice?",
      textAr: "أي مما يلي ممارسة جيدة للاجتماعات الافتراضية؟",
      optionsEn: [
        "No agenda",
        "Clear agenda and roles",
        "Overbook time",
        "No summaries",
      ],
      optionsAr: [
        "بدون جدول أعمال",
        "جدول واضح وأدوار محددة",
        "تمديد الوقت بلا داعٍ",
        "بدون ملخصات",
      ],
      correctIndex: 1,
    },
    {
      id: "2-10",
      textEn: "Phishing is:",
      textAr: "التصيد الاحتيالي هو:",
      optionsEn: [
        "A secure login",
        "Fraudulent attempt to get data",
        "A payment service",
        "A browser feature",
      ],
      optionsAr: [
        "تسجيل دخول آمن",
        "محاولة احتيالية للحصول على البيانات",
        "خدمة دفع",
        "ميزة في المتصفح",
      ],
      correctIndex: 1,
    },
    {
      id: "2-11",
      textEn: "Version control helps you:",
      textAr: "التحكم في الإصدارات يساعدك على:",
      optionsEn: ["Track changes", "Delete history", "Disable teamwork", "Hide files"],
      optionsAr: ["تتبع التغييرات", "حذف السجل", "تعطيل العمل الجماعي", "إخفاء الملفات"],
      correctIndex: 0,
    },
    {
      id: "2-12",
      textEn: "To lead online, communication should be:",
      textAr: "لقيادة فعالة عبر الإنترنت يجب أن تكون التواصل:",
      optionsEn: ["Rare", "Vague", "Frequent and clear", "One-way only"],
      optionsAr: ["نادراً", "غامضاً", "متكرراً وواضحاً", "أحادياً"],
      correctIndex: 2,
    },
    {
      id: "2-13",
      textEn: "Digital ethics includes:",
      textAr: "الأخلاقيات الرقمية تشمل:",
      optionsEn: ["Privacy & respect", "Leak data", "Harassment", "Spam"],
      optionsAr: ["الخصوصية والاحترام", "تسريب البيانات", "التحرش", "الرسائل المزعجة"],
      correctIndex: 0,
    },
    {
      id: "2-14",
      textEn: "Which boosts remote motivation?",
      textAr: "ما الذي يعزز التحفيز عن بُعد؟",
      optionsEn: ["No feedback", "Recognition & support", "Micromanage", "Ignore wins"],
      optionsAr: ["بدون ملاحظات", "التقدير والدعم", "الرقابة المفرطة", "تجاهل الإنجازات"],
      correctIndex: 1,
    },
    {
      id: "2-15",
      textEn: "Leaders should handle conflicts by:",
      textAr: "يجب على القادة التعامل مع الخلافات من خلال:",
      optionsEn: [
        "Avoiding all discussion",
        "Calm mediation and clarity",
        "Public blame",
        "Delays",
      ],
      optionsAr: [
        "تجنب النقاش تماماً",
        "الوساطة الهادئة والوضوح",
        "اللوم العلني",
        "التأجيل",
      ],
      correctIndex: 1,
    },
  ],
  "3": [
    {
      id: "3-1",
      textEn: "An entrepreneur is someone who:",
      textAr: "رائد الأعمال هو الشخص الذي:",
      optionsEn: [
        "Avoids risk and change",
        "Starts and grows ventures",
        "Works only as employee",
        "Waits for orders",
      ],
      optionsAr: [
        "يتجنب المخاطر والتغيير",
        "يبدأ وينمي المشاريع",
        "يعمل كموظف فقط",
        "ينتظر الأوامر",
      ],
      correctIndex: 1,
    },
    {
      id: "3-2",
      textEn: "MVP stands for:",
      textAr: "MVP تعني:",
      optionsEn: [
        "Most Valuable Person",
        "Minimum Viable Product",
        "Maximum Value Price",
        "Market Value Plan",
      ],
      optionsAr: [
        "الشخص الأكثر قيمة",
        "المنتج القابل للتجربة بأقل خصائص",
        "أقصى سعر للقيمة",
        "خطة القيمة السوقية",
      ],
      correctIndex: 1,
    },
    {
      id: "3-3",
      textEn: "Market research helps you:",
      textAr: "أبحاث السوق تساعدك على:",
      optionsEn: [
        "Guess randomly",
        "Understand customer needs",
        "Ignore competitors",
        "Raise costs only",
      ],
      optionsAr: [
        "التخمين عشوائياً",
        "فهم احتياجات العملاء",
        "تجاهل المنافسين",
        "رفع التكاليف فقط",
      ],
      correctIndex: 1,
    },
    {
      id: "3-4",
      textEn: "A value proposition explains:",
      textAr: "عرض القيمة يوضح:",
      optionsEn: [
        "Why your solution matters",
        "Your office location",
        "Team birthdays",
        "Bank holidays",
      ],
      optionsAr: [
        "لماذا حلّك مهم",
        "موقع المكتب",
        "أعياد ميلاد الفريق",
        "العطل البنكية",
      ],
      correctIndex: 0,
    },
    {
      id: "3-5",
      textEn: "Cash flow in startups is:",
      textAr: "التدفق النقدي في الشركات الناشئة هو:",
      optionsEn: [
        "Irrelevant",
        "Critical to survival",
        "A minor metric",
        "Only profit-based",
      ],
      optionsAr: [
        "غير مهم",
        "حاسِم للبقاء",
        "مؤشر ثانوي",
        "يعتمد على الربح فقط",
      ],
      correctIndex: 1,
    },
    {
      id: "3-6",
      textEn: "Which is a lean approach?",
      textAr: "أي مما يلي نهج رشيق؟",
      optionsEn: [
        "Build big first",
        "Small tests and iterate",
        "Ignore feedback",
        "No metrics",
      ],
      optionsAr: [
        "البناء الكبير أولاً",
        "اختبارات صغيرة وتكرار التحسين",
        "تجاهل الملاحظات",
        "بدون مؤشرات",
      ],
      correctIndex: 1,
    },
    {
      id: "3-7",
      textEn: "Break-even point means:",
      textAr: "نقطة التعادل تعني:",
      optionsEn: [
        "Zero sales",
        "Revenue equals costs",
        "High profit",
        "No expenses",
      ],
      optionsAr: ["صفر مبيعات", "الإيرادات تساوي التكاليف", "ربح مرتفع", "بدون مصروفات"],
      correctIndex: 1,
    },
    {
      id: "3-8",
      textEn: "Which funding is non-repayable?",
      textAr: "أي تمويل لا يتطلب السداد؟",
      optionsEn: ["Grant", "Loan", "Credit line", "Bond"],
      optionsAr: ["منحة", "قرض", "تسهيل ائتماني", "سند"],
      correctIndex: 0,
    },
    {
      id: "3-9",
      textEn: "Prototyping helps to:",
      textAr: "يساعد عمل النماذج الأولية على:",
      optionsEn: [
        "Delay launch",
        "Test ideas cheaply",
        "Confuse customers",
        "Hide features",
      ],
      optionsAr: [
        "تأخير الإطلاق",
        "اختبار الأفكار بتكلفة منخفضة",
        "إرباك العملاء",
        "إخفاء الميزات",
      ],
      correctIndex: 1,
    },
    {
      id: "3-10",
      textEn: "A sustainable business model is:",
      textAr: "نموذج العمل المستدام هو:",
      optionsEn: [
        "Unclear revenue",
        "Generates repeatable value",
        "Short-term only",
        "Ignores costs",
      ],
      optionsAr: [
        "إيرادات غير واضحة",
        "ينتج قيمة قابلة للتكرار",
        "قصير الأجل فقط",
        "يتجاهل التكاليف",
      ],
      correctIndex: 1,
    },
    {
      id: "3-11",
      textEn: "Which channel is best for quick customer feedback?",
      textAr: "أي قناة أفضل للحصول على ملاحظات سريعة من العملاء؟",
      optionsEn: ["Email only", "Interviews/surveys", "No contact", "Random ads"],
      optionsAr: ["البريد فقط", "المقابلات/الاستبيانات", "بدون تواصل", "إعلانات عشوائية"],
      correctIndex: 1,
    },
    {
      id: "3-12",
      textEn: "Pricing should consider:",
      textAr: "يجب أن يأخذ التسعير في الاعتبار:",
      optionsEn: ["Only competitor price", "Value & costs", "Guessing", "No research"],
      optionsAr: [
        "سعر المنافس فقط",
        "القيمة والتكاليف",
        "التخمين",
        "بدون بحث",
      ],
      correctIndex: 1,
    },
    {
      id: "3-13",
      textEn: "Pivoting means:",
      textAr: "المحورية (Pivot) تعني:",
      optionsEn: [
        "Stopping all work",
        "Changing strategy based on learning",
        "Hiring only",
        "Cutting all features",
      ],
      optionsAr: [
        "إيقاف كل العمل",
        "تغيير الاستراتيجية بناءً على التعلم",
        "التوظيف فقط",
        "حذف كل الميزات",
      ],
      correctIndex: 1,
    },
    {
      id: "3-14",
      textEn: "Social entrepreneurship focuses on:",
      textAr: "ريادة الأعمال الاجتماعية تركز على:",
      optionsEn: [
        "Only profit",
        "Social impact with viability",
        "No revenues",
        "Personal gain",
      ],
      optionsAr: [
        "الربح فقط",
        "الأثر الاجتماعي مع الاستدامة",
        "بدون إيرادات",
        "مكاسب شخصية",
      ],
      correctIndex: 1,
    },
    {
      id: "3-15",
      textEn: "A simple pitch should include:",
      textAr: "يجب أن يشمل العرض السريع على:",
      optionsEn: [
        "Problem, solution, value",
        "Team birthdays",
        "Office paint color",
        "Travel plans",
      ],
      optionsAr: [
        "المشكلة، الحل، القيمة",
        "أعياد ميلاد الفريق",
        "لون طلاء المكتب",
        "خطط السفر",
      ],
      correctIndex: 0,
    },
  ],
};


function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


const Quiz: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === "Arabic";
  const { courseId } = useParams<{ courseId: string }>();

  const courseQuestions = useMemo(() => {
    const bank = BANK[courseId || ""];
    if (!bank) return [];
    
    return bank;
  }, [courseId]);

 
  const seedRef = useRef<number>(Date.now());
  const orderedQuestions = useMemo(
    () => shuffle(courseQuestions, seedRef.current),
    [courseQuestions]
  );

  
  const [answers, setAnswers] = useState<number[]>(
    () => new Array(orderedQuestions.length).fill(-1)
  );

  const [idx, setIdx] = useState(0);

  
  const TOTAL_SECONDS = 30 * 60;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scorePct, setScorePct] = useState(0);
  const [savingNote, setSavingNote] = useState("");

  
  const courseTitle = useMemo(() => {
    const st = loadState();
    if (!st || !courseId) return isAr ? "الدورة" : "Course";
    const c = st.courses?.find((x) => x.id === courseId);
    if (!c) return isAr ? "الدورة" : "Course";
    return isAr ? c.titleAr : c.titleEn;
  }, [courseId, isAr]);

  
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          doSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function choose(i: number, opt: number) {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = opt;
      return next;
    });
  }

  function doSubmit(auto = false) {
    if (submitted) return;
    
    const total = orderedQuestions.length || 1;
    let correct = 0;
    answers.forEach((ans, i) => {
      if (ans === orderedQuestions[i].correctIndex) correct += 1;
    });
    const pct = Math.round((correct / total) * 100);
    setScorePct(pct);
    setSubmitted(true);

    const st = loadState();
    if (st) {
      const xpGain = pct >= 85 ? 40 : pct >= 70 ? 25 : pct >= 50 ? 15 : 5;
      const newXP = Math.max(0, (st.xp || 0) + xpGain);

      const results = { ...(st.quizResults || {}) };
      const prev = results[courseId || ""] || {
        lastScore: 0,
        attempts: 0,
        lastAt: "",
      };
      results[courseId || ""] = {
        lastScore: pct,
        attempts: prev.attempts + 1,
        lastAt: new Date().toISOString(),
      };

      const ach = new Set(st.achievements || []);
      ach.add("quiz-attempt");
      if (pct >= 90) ach.add("quiz-90");
      if (newXP >= 200) ach.add("200xp");

      const updated: PersistShape = {
        ...st,
        xp: newXP,
        quizResults: results,
        achievements: Array.from(ach),
        lastActive: new Date().toISOString(),
      };
      saveState(updated);
      setSavingNote(isAr ? "تم حفظ نتيجتك." : "Your result has been saved.");
    }

    if (auto) {
      
      setConfirmOpen(false);
    }
  }

  if (!courseId || orderedQuestions.length === 0) {
    return (
      <div className={`quiz-page ${isAr ? "rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
        <div className="quiz-container">
          <h2>{isAr ? "لا توجد أسئلة متاحة" : "No questions available."}</h2>
          <div className="quiz-actions">
            <Link to="/courses" className="btn outline">
              {isAr ? "عودة إلى الدورات" : "Back to Courses"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = orderedQuestions[idx];
  const tQuestion = isAr ? q.textAr : q.textEn;
  const tOptions = isAr ? q.optionsAr : q.optionsEn;

  return (
    <div className={`quiz-page ${isAr ? "rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="quiz-container">
        {/* Header */}
        <header className="quiz-header">
          <div className="quiz-title">
            <h2>
              {isAr ? T.pageTitle.Arabic : T.pageTitle.English}: {courseTitle}
            </h2>
            <p className="muted">
              {isAr
                ? "15 سؤالاً، 30 دقيقة، 4 اختيارات لكل سؤال."
                : "15 questions, 30 minutes, 4 choices each."}
            </p>
          </div>
          <div
            className={`timer ${secondsLeft <= 60 ? "danger" : ""}`}
            aria-live="polite"
          >
            <span>{isAr ? T.timeLeft.Arabic : T.timeLeft.English}:</span>{" "}
            <strong>{formatTime(secondsLeft)}</strong>
          </div>
        </header>

        {/* Progress */}
        <div className="quiz-progress">
          <span>
            {isAr ? T.question.Arabic : T.question.English} {idx + 1}{" "}
            {isAr ? T.of.Arabic : T.of.English} {orderedQuestions.length}
          </span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(((idx + 1) / orderedQuestions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <h3 className="question-text">{tQuestion}</h3>
          <ul className="options">
            {tOptions.map((opt, i) => {
              const selected = answers[idx] === i;
              const isCorrect = submitted && i === q.correctIndex;
              const isWrong =
                submitted && selected && i !== q.correctIndex;

              return (
                <li key={i}>
                  <button
                    type="button"
                    className={[
                      "option",
                      selected ? "selected" : "",
                      isCorrect ? "correct" : "",
                      isWrong ? "incorrect" : "",
                    ].join(" ")}
                    onClick={() => choose(idx, i)}
                    disabled={submitted}
                    aria-pressed={selected}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {submitted && (
            <div className="explain">
              <strong>{isAr ? T.explanation.Arabic : T.explanation.English}:</strong>{" "}
              {isAr
                ? "الإجابة الصحيحة مميّزة باللون الأخضر."
                : "The correct answer is highlighted in green."}
            </div>
          )}
        </div>

        {/* Navigation / Actions */}
        <div className="quiz-actions">
          <button
            className="btn ghost"
            onClick={() => setIdx((p) => Math.max(0, p - 1))}
            disabled={idx === 0}
          >
            {isAr ? T.prev.Arabic : T.prev.English}
          </button>

          {!submitted ? (
            <>
              <button
                className="btn primary"
                onClick={() => {
                  if (idx < orderedQuestions.length - 1) {
                    setIdx((p) => p + 1);
                  } else {
                    setConfirmOpen(true);
                  }
                }}
              >
                {idx < orderedQuestions.length - 1
                  ? isAr
                    ? T.next.Arabic
                    : T.next.English
                  : isAr
                  ? T.submit.Arabic
                  : T.submit.English}
              </button>

              {/* Confirm modal */}
              {confirmOpen && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                  <div className="modal-card">
                    <h4>
                      {isAr
                        ? T.confirmSubmitTitle.Arabic
                        : T.confirmSubmitTitle.English}
                    </h4>
                    <p>
                      {isAr
                        ? T.confirmSubmitBody.Arabic
                        : T.confirmSubmitBody.English}
                    </p>
                    <div className="modal-actions">
                      <button
                        className="btn outline"
                        onClick={() => setConfirmOpen(false)}
                      >
                        {isAr ? T.cancel.Arabic : T.cancel.English}
                      </button>
                      <button className="btn primary" onClick={() => doSubmit(false)}>
                        {isAr ? T.confirm.Arabic : T.confirm.English}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
           
            <div className="results">
              <h3>{isAr ? T.resultsTitle.Arabic : T.resultsTitle.English}</h3>
              <div className="score-box">
                <div className="score-big">
                  {isAr ? T.score.Arabic : T.score.English}: {scorePct}%
                </div>
                <div className="saved-note">
                  {savingNote ||
                    (isAr ? T.answersSaved.Arabic : T.answersSaved.English)}
                </div>
              </div>
              <div className="results-actions">
                <button
                  className="btn outline"
                  onClick={() => window.location.reload()}
                >
                  {isAr ? T.retake.Arabic : T.retake.English}
                </button>
                <Link className="btn ghost" to={`/course/${courseId}`}>
                  {isAr ? T.backToCourse.Arabic : T.backToCourse.English}
                </Link>
                <Link className="btn primary" to="/learner-dashboard">
                  {isAr ? T.backToDashboard.Arabic : T.backToDashboard.English}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
