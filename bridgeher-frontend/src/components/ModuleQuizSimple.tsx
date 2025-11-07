import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface ModuleQuizSimpleProps {
  moduleId?: number;
  moduleTitle: string;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
  isArabic: boolean;
}

const ModuleQuizSimple: React.FC<ModuleQuizSimpleProps> = ({ 
  moduleTitle, 
  onQuizComplete, 
  onClose, 
  isArabic 
}) => {
  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: isArabic ? "ما هو المكون الرئيسي للحاسوب الذي يعالج البيانات؟" : "What is the main component of a computer that processes data?",
      options: isArabic ? ["المعالج (CPU)", "الذاكرة (RAM)", "القرص الصلب", "الشاشة"] : ["CPU", "RAM", "Hard Drive", "Monitor"],
      correct: 0
    },
    {
      id: 2,
      question: isArabic ? "التعلم المستمر مهم للنمو الشخصي. صحيح أم خطأ؟" : "Continuous learning is important for personal growth. True or False?",
      options: isArabic ? ["صحيح", "خطأ"] : ["True", "False"],
      correct: 0
    },
    {
      id: 3,
      question: isArabic ? "أي مما يلي يُعتبر من مهارات التكنولوجيا الأساسية؟" : "Which of the following is considered a basic technology skill?",
      options: isArabic ? ["استخدام البريد الإلكتروني", "الطبخ", "الرياضة", "الموسيقى"] : ["Using email", "Cooking", "Sports", "Music"],
      correct: 0
    }
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correctAnswers++;
      }
    });
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    setScore(percentage);
    setShowResult(true);
    
    // Pass if score >= 70%
    const passed = percentage >= 70;
    setTimeout(() => {
      onQuizComplete(passed);
    }, 2000);
  };

  if (showResult) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{
          background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', textAlign: 'center'
        }}>
          <h2 style={{color: '#4A148C', marginBottom: '20px'}}>
            {isArabic ? 'نتيجة الاختبار' : 'Quiz Result'}
          </h2>
          <div style={{
            fontSize: '48px', fontWeight: 'bold', margin: '20px 0',
            color: score >= 70 ? '#2E7D32' : '#E53935'
          }}>
            {score}%
          </div>
          <p style={{fontSize: '18px', marginBottom: '20px'}}>
            {score >= 70 
              ? (isArabic ? '🎉 تهانينا! لقد نجحت!' : '🎉 Congratulations! You passed!')
              : (isArabic ? '❌ تحتاج إلى 70% للنجاح' : '❌ You need 70% to pass')
            }
          </p>
          <button 
            onClick={onClose}
            style={{
              background: '#4A148C', color: 'white', border: 'none',
              padding: '12px 30px', borderRadius: '5px', fontSize: '16px', cursor: 'pointer'
            }}
          >
            {isArabic ? 'متابعة' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #4A148C', paddingBottom: '15px'}}>
          <h2 style={{color: '#4A148C', margin: 0}}>
            {isArabic ? `اختبار: ${moduleTitle}` : `Quiz: ${moduleTitle}`}
          </h2>
          <div style={{background: '#FFD700', color: '#4A148C', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
            ⏰ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <span>{isArabic ? 'السؤال' : 'Question'} {currentQuestion + 1} {isArabic ? 'من' : 'of'} {questions.length}</span>
          </div>
          <div style={{background: '#E0E0E0', height: '8px', borderRadius: '4px'}}>
            <div style={{
              background: '#4A148C', height: '100%', borderRadius: '4px',
              width: `${((currentQuestion + 1) / questions.length) * 100}%`
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{marginBottom: '30px'}}>
          <h3 style={{marginBottom: '20px', fontSize: '18px', lineHeight: '1.5'}}>
            {question.question}
          </h3>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '15px', border: '2px solid',
                  borderColor: answers[currentQuestion] === index ? '#4A148C' : '#CCC',
                  borderRadius: '8px', background: answers[currentQuestion] === index ? '#F3E5F5' : 'white',
                  cursor: 'pointer', textAlign: 'left', fontSize: '16px'
                }}
              >
                <span style={{
                  background: answers[currentQuestion] === index ? '#4A148C' : '#CCC',
                  color: 'white', borderRadius: '50%', width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '15px', fontSize: '14px', fontWeight: 'bold'
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              background: currentQuestion === 0 ? '#CCC' : '#6C757D',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isArabic ? 'السابق' : 'Previous'}
          </button>

          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            style={{
              background: answers[currentQuestion] !== undefined ? '#4A148C' : '#CCC',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px',
              cursor: answers[currentQuestion] !== undefined ? 'pointer' : 'not-allowed'
            }}
          >
            {currentQuestion === questions.length - 1 
              ? (isArabic ? 'إرسال' : 'Submit')
              : (isArabic ? 'التالي' : 'Next')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleQuizSimple;