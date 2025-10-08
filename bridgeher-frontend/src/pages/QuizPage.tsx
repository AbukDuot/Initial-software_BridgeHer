import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/quiz.css";

interface Question {
  question: { English: string; Arabic: string };
  options: { English: string[]; Arabic: string[] };
  correctIndex: number;
}

const quizData: Record<string, Question[]> = {
  // 🟣 Course 1: Digital Literacy
  "1-m1": [
    {
      question: {
        English: "What does digital literacy mean?",
        Arabic: "ماذا تعني الثقافة الرقمية؟",
      },
      options: {
        English: [
          "The ability to use digital devices effectively",
          "Learning how to drive",
          "Writing letters on paper",
          "Speaking multiple languages",
        ],
        Arabic: [
          "القدرة على استخدام الأجهزة الرقمية بفعالية",
          "تعلم القيادة",
          "كتابة الرسائل على الورق",
          "التحدث بعدة لغات",
        ],
      },
      correctIndex: 0,
    },
    {
      question: {
        English: "Which device is an example of digital technology?",
        Arabic: "أي جهاز يعد مثالًا على التكنولوجيا الرقمية؟",
      },
      options: {
        English: ["Radio", "Typewriter", "Smartphone", "Chalkboard"],
        Arabic: ["الراديو", "آلة كاتبة", "الهاتف الذكي", "السبورة"],
      },
      correctIndex: 2,
    },
    {
      question: {
        English: "What is the safest way to create a strong password?",
        Arabic: "ما هي الطريقة الأكثر أمانًا لإنشاء كلمة مرور قوية؟",
      },
      options: {
        English: [
          "Using your name",
          "Using random letters, numbers, and symbols",
          "Using your birth date",
          "Using a simple word",
        ],
        Arabic: [
          "استخدام اسمك",
          "استخدام حروف وأرقام ورموز عشوائية",
          "استخدام تاريخ ميلادك",
          "استخدام كلمة بسيطة",
        ],
      },
      correctIndex: 1,
    },
    {
      question: {
        English: "Which of the following is NOT a web browser?",
        Arabic: "أي مما يلي ليس متصفح ويب؟",
      },
      options: {
        English: ["Google Chrome", "Mozilla Firefox", "Microsoft Word", "Safari"],
        Arabic: ["جوجل كروم", "موزيلا فايرفوكس", "مايكروسوفت وورد", "سفاري"],
      },
      correctIndex: 2,
    },
  ],

  // 🟣 Course 2: Entrepreneurship
  "2-m1": [
    {
      question: {
        English: "What is the first step to starting a business?",
        Arabic: "ما هي الخطوة الأولى لبدء مشروع تجاري؟",
      },
      options: {
        English: [
          "Having a clear business idea",
          "Borrowing money",
          "Hiring employees",
          "Registering a website",
        ],
        Arabic: [
          "امتلاك فكرة مشروع واضحة",
          "اقتراض المال",
          "توظيف موظفين",
          "تسجيل موقع إلكتروني",
        ],
      },
      correctIndex: 0,
    },
    {
      question: {
        English: "Who is an entrepreneur?",
        Arabic: "من هو رائد الأعمال؟",
      },
      options: {
        English: [
          "A person who starts and manages a business",
          "A student in school",
          "A government employee",
          "A sports coach",
        ],
        Arabic: [
          "الشخص الذي يبدأ ويدير مشروعًا تجاريًا",
          "طالب في المدرسة",
          "موظف حكومي",
          "مدرب رياضي",
        ],
      },
      correctIndex: 0,
    },
  ],
};

const QuizPage: React.FC = () => {
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>();
  const { language } = useLanguage();
  const isArabic = language === "Arabic";

  const key = `${id}-m${moduleId?.replace("m", "")}`;
  const questions = quizData[key] || [];
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (index: number) => {
    setAnswers([...answers, index]);
    if (index === questions[current].correctIndex) {
      setScore(score + 1);
    }
    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
    } else {
      setIsFinished(true);
      localStorage.setItem(`quiz-${key}`, JSON.stringify({ score, total: questions.length }));
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <h3>{isArabic ? "لا توجد أسئلة لهذه الوحدة." : "No questions available for this module."}</h3>
      </div>
    );
  }

  const q = questions[current];

  return (
    <section className={`quiz-page ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="quiz-container">
        {!isFinished ? (
          <>
            <h2 className="quiz-title">{q.question[language]}</h2>
            <div className="quiz-options">
              {q.options[language].map((opt, i) => (
                <button key={i} className="quiz-btn" onClick={() => handleAnswer(i)}>
                  {opt}
                </button>
              ))}
            </div>
            <p className="progress">
              {isArabic
                ? `السؤال ${current + 1} من ${questions.length}`
                : `Question ${current + 1} of ${questions.length}`}
            </p>
          </>
        ) : (
          <div className="quiz-result">
            <h2>
              {isArabic ? "انتهيت!" : "You’re done!"} 🎉
            </h2>
            <p>
              {isArabic
                ? `لقد حصلت على ${score} من ${questions.length}`
                : `You scored ${score} out of ${questions.length}`}
            </p>
            <div className="quiz-buttons">
              <button onClick={handleRestart} className="btn retry">
                {isArabic ? "إعادة المحاولة" : "Try Again"}
              </button>
              <Link to={`/course/${id}`} className="btn back">
                {isArabic ? "العودة إلى الدورة" : "Back to Course"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizPage;
