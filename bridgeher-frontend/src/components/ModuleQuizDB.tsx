import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { showToast } from '../utils/toast';

interface Question {
  id?: number;
  question: string;
  options: string[];
  correct_answer?: string;
  correctAnswer?: number;
  points?: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  questions: Question[];
  attemptCount?: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
}

interface ModuleQuizDBProps {
  moduleId: number;
  moduleTitle: string;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
  isArabic: boolean;
}

const ModuleQuizDB: React.FC<ModuleQuizDBProps> = ({ 
  moduleId, 
  moduleTitle, 
  onQuizComplete, 
  onClose, 
  isArabic 
}) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, showResult, quiz]);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/quiz/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.attemptCount >= data.maxAttempts) {
          showToast(isArabic ? 'لقد وصلت إلى الحد الأقصى من المحاولات (3)' : 'You have reached the maximum attempts (3) for this quiz', 'error');
          onClose();
          return;
        }
        
        setQuiz(data);
        setAttemptNumber(data.attemptCount + 1);
        setAttemptsRemaining(data.attemptsRemaining);
        setTimeLeft(data.time_limit * 60); 
      } else {
        const fallbackQuiz = {
          id: 0,
          title: `${moduleTitle} Quiz`,
          description: `Test your knowledge of ${moduleTitle}`,
          time_limit: 30,
          passing_score: 70,
          questions: [
            {
              id: 1,
              question: isArabic ? "ما هو المكون الرئيسي للحاسوب الذي يعالج البيانات؟" : "What is the main component of a computer that processes data?",
              options: isArabic ? ["المعالج (CPU)", "الذاكرة (RAM)", "القرص الصلب", "الشاشة"] : ["CPU", "RAM", "Hard Drive", "Monitor"],
              correct_answer: isArabic ? "المعالج (CPU)" : "CPU",
              points: 1
            },
            {
              id: 2,
              question: isArabic ? "التعلم المستمر مهم للنمو الشخصي. صحيح أم خطأ؟" : "Continuous learning is important for personal growth. True or False?",
              options: isArabic ? ["صحيح", "خطأ"] : ["True", "False"],
              correct_answer: isArabic ? "صحيح" : "True",
              points: 1
            },
            {
              id: 3,
              question: isArabic ? "أي مما يلي يُعتبر من مهارات التكنولوجيا الأساسية؟" : "Which of the following is considered a basic technology skill?",
              options: isArabic ? ["استخدام البريد الإلكتروني", "الطبخ", "الرياضة", "الموسيقى"] : ["Using email", "Cooking", "Sports", "Music"],
              correct_answer: isArabic ? "استخدام البريد الإلكتروني" : "Using email",
              points: 1
            }
          ]
        };
        setQuiz(fallbackQuiz);
        setTimeLeft(fallbackQuiz.time_limit * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      
      const fallbackQuiz = {
        id: 0,
        title: `${moduleTitle} Quiz`,
        description: `Test your knowledge of ${moduleTitle}`,
        time_limit: 30,
        passing_score: 70,
        questions: [
          {
            id: 1,
            question: "What is the main component of a computer that processes data?",
            options: ["CPU", "RAM", "Hard Drive", "Monitor"],
            correct_answer: "CPU",
            points: 1
          }
        ]
      };
      setQuiz(fallbackQuiz);
      setTimeLeft(fallbackQuiz.time_limit * 60);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number | string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz!.questions.length - 1) {
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

  const handleSubmit = async () => {
    if (!quiz) return;

    let correctAnswers = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q, index) => {
      totalPoints += (q.points || 1);
      const correctAnswer = q.correct_answer || q.options[q.correctAnswer || 0];
      if (answers[q.id || index] === correctAnswer) {
        correctAnswers += (q.points || 1);
      }
    });

    const percentage = Math.round((correctAnswers / totalPoints) * 100);
    setScore(percentage);
    setShowResult(true);

    if (quiz.id > 0) {
      try {
        const token = localStorage.getItem('token');
        const timeSpent = (quiz.time_limit * 60) - timeLeft;
        
        const submitRes = await fetch(`${API_BASE_URL}/api/quiz/${quiz.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers, timeSpent })
        });
        
        if (submitRes.ok) {
          const submitData = await submitRes.json();
          setAttemptNumber(submitData.attemptNumber);
          setAttemptsRemaining(submitData.attemptsRemaining);
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center'}}>
          <h2>{isArabic ? 'جاري تحميل الاختبار...' : 'Loading Quiz...'}</h2>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center'}}>
          <h2>{isArabic ? 'لم يتم العثور على اختبار' : 'No Quiz Found'}</h2>
          <button onClick={onClose} style={{background: '#4A148C', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', marginTop: '10px'}}>
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

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
            color: score >= quiz.passing_score ? '#2E7D32' : '#E53935'
          }}>
            {score}%
          </div>
          <p style={{fontSize: '18px', marginBottom: '10px'}}>
            {score >= quiz.passing_score 
              ? (isArabic ? '🎉 تهانينا! لقد نجحت!' : '🎉 Congratulations! You passed!')
              : (isArabic ? ` تحتاج إلى ${quiz.passing_score}% للنجاح` : ` You need ${quiz.passing_score}% to pass`)
            }
          </p>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
            {isArabic ? `المحاولة ${attemptNumber} من 3` : `Attempt ${attemptNumber} of 3`}
            {attemptsRemaining > 0 && score < quiz.passing_score && (
              <span style={{display: 'block', marginTop: '5px', color: '#4A148C'}}>
                {isArabic ? `${attemptsRemaining} محاولات متبقية` : `${attemptsRemaining} attempts remaining`}
              </span>
            )}
          </p>
          <div style={{display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px'}}>
            <button 
              onClick={() => {
                setShowResult(false);
                setCurrentQuestion(0);
                setAnswers({});
                setTimeLeft(quiz.time_limit * 60);
                fetchQuiz();
              }}
              style={{
                background: '#E53935', color: 'white', border: '2px solid #E53935',
                padding: '12px 30px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              🔄 {isArabic ? 'إعادة المحاولة' : 'RETAKE QUIZ'}
            </button>
            
            <button 
              onClick={() => {
                const passed = score >= quiz.passing_score;
                onQuizComplete(passed);
                onClose();
              }}
              style={{
                background: '#FFD700', color: '#4A148C', border: '2px solid #4A148C',
                padding: '12px 30px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              ← {isArabic ? 'العودة إلى الوحدة' : 'BACK TO MODULE'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #4A148C', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px'}}>
          <div>
            <h2 style={{color: '#4A148C', margin: 0}}>
              {quiz.title}
            </h2>
            <p style={{fontSize: '12px', color: '#666', margin: '5px 0 0 0'}}>
              {isArabic ? `المحاولة ${attemptNumber} من 3` : `Attempt ${attemptNumber} of 3`} | 
              {isArabic ? ` ${attemptsRemaining} متبقية` : ` ${attemptsRemaining} remaining`}
            </p>
          </div>
          <div style={{background: timeLeft < 300 ? '#E53935' : '#FFD700', color: timeLeft < 300 ? 'white' : '#4A148C', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <span>{isArabic ? 'السؤال' : 'Question'} {currentQuestion + 1} {isArabic ? 'من' : 'of'} {quiz.questions.length}</span>
          </div>
          <div style={{background: '#E0E0E0', height: '8px', borderRadius: '4px'}}>
            <div style={{
              background: '#4A148C', height: '100%', borderRadius: '4px',
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`
            }} />
          </div>
        </div>

        <div style={{marginBottom: '30px'}}>
          <h3 style={{marginBottom: '20px', fontSize: '18px', lineHeight: '1.5'}}>
            {question.question}
          </h3>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id || currentQuestion, option)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '15px', border: '2px solid',
                  borderColor: answers[question.id || currentQuestion] === option ? '#4A148C' : '#CCC',
                  borderRadius: '8px', background: answers[question.id || currentQuestion] === option ? '#F3E5F5' : 'white',
                  cursor: 'pointer', textAlign: 'left', fontSize: '16px'
                }}
              >
                <span style={{
                  background: answers[question.id || currentQuestion] === option ? '#4A148C' : '#CCC',
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
            disabled={!answers[question.id || currentQuestion]}
            style={{
              background: answers[question.id || currentQuestion] ? '#4A148C' : '#CCC',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px',
              cursor: answers[question.id || currentQuestion] ? 'pointer' : 'not-allowed'
            }}
          >
            {currentQuestion === quiz.questions.length - 1 
              ? (isArabic ? 'إرسال' : 'Submit')
              : (isArabic ? 'التالي' : 'Next')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleQuizDB;
