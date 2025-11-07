import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/interactiveQuiz.css';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'drag-drop' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

interface InteractiveQuizProps {
  moduleId: number;
  onComplete: (score: number, totalPoints: number) => void;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ moduleId, onComplete }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [, ] = useState<string[]>([]);
  const [dropZones, setDropZones] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  const loadQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/quiz/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        // Mock quiz data
        setQuestions([
          {
            id: 1,
            question: 'What is the first step in creating a budget?',
            type: 'multiple-choice',
            options: ['Track expenses', 'Set goals', 'Calculate income', 'Pay bills'],
            correctAnswer: 'Calculate income',
            explanation: 'You need to know how much money you have coming in before you can plan how to spend it.',
            points: 10
          },
          {
            id: 2,
            question: 'Saving money is important for financial security.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Having savings provides a financial safety net for emergencies.',
            points: 5
          },
          {
            id: 3,
            question: 'Match the financial terms with their definitions:',
            type: 'drag-drop',
            options: ['Budget', 'Investment', 'Debt', 'Asset'],
            correctAnswer: ['Budget:Plan', 'Investment:Growth', 'Debt:Owed', 'Asset:Value'],
            explanation: 'Understanding financial terminology is crucial for financial literacy.',
            points: 15
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer });
  };

  const handleNext = () => {
    if (!showFeedback) {
      setShowFeedback(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.type === 'drag-drop') {
        // Check drag-drop answers
        const correctPairs = question.correctAnswer as string[];
        const userPairs = userAnswer as string[];
        if (userPairs && userPairs.length === correctPairs.length) {
          const correctCount = correctPairs.filter(pair => userPairs.includes(pair)).length;
          totalScore += (correctCount / correctPairs.length) * question.points;
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          totalScore += question.points;
        }
      }
    });

    setScore(totalScore);
    setQuizCompleted(true);
    onComplete(totalScore, totalPoints);
  };

  const isCorrect = () => {
    const question = questions[currentQuestion];
    const userAnswer = answers[question.id];
    
    if (question.type === 'drag-drop') {
      const correctPairs = question.correctAnswer as string[];
      const userPairs = userAnswer as string[];
      return userPairs && correctPairs.every(pair => userPairs.includes(pair));
    }
    
    return userAnswer === question.correctAnswer;
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    const newDropZones = { ...dropZones, [zone]: item };
    setDropZones(newDropZones);
    
    // Update answer for drag-drop
    const pairs = Object.entries(newDropZones).map(([zone, item]) => `${item}:${zone}`);
    handleAnswer(pairs);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const t = {
    question: isAr ? 'سؤال' : 'Question',
    of: isAr ? 'من' : 'of',
    next: isAr ? 'التالي' : 'Next',
    submit: isAr ? 'إرسال' : 'Submit',
    correct: isAr ? 'صحيح!' : 'Correct!',
    incorrect: isAr ? 'خطأ!' : 'Incorrect!',
    explanation: isAr ? 'التفسير' : 'Explanation',
    quizComplete: isAr ? 'اكتمل الاختبار!' : 'Quiz Complete!',
    yourScore: isAr ? 'نتيجتك' : 'Your Score',
    retake: isAr ? 'إعادة الاختبار' : 'Retake Quiz',
    continue: isAr ? 'متابعة' : 'Continue',
  };

  if (questions.length === 0) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100);
    
    return (
      <div className={`quiz-complete ${isAr ? 'rtl' : ''}`}>
        <div className="completion-icon">🎉</div>
        <h2>{t.quizComplete}</h2>
        <div className="score-display">
          <div className="score-circle">
            <span className="percentage">{percentage}%</span>
          </div>
          <p>{t.yourScore}: {score} / {questions.reduce((sum, q) => sum + q.points, 0)} points</p>
        </div>
        <div className="completion-actions">
          <button onClick={() => window.location.reload()} className="btn secondary">
            {t.retake}
          </button>
          <button onClick={() => onComplete(score, questions.reduce((sum, q) => sum + q.points, 0))} className="btn primary">
            {t.continue}
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const userAnswer = answers[question.id];

  return (
    <div className={`interactive-quiz ${isAr ? 'rtl' : ''}`}>
      <div className="quiz-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="question-counter">
          {t.question} {currentQuestion + 1} {t.of} {questions.length}
        </span>
      </div>

      <div className="question-content">
        <h3>{question.question}</h3>

        {question.type === 'multiple-choice' && (
          <div className="options-grid">
            {question.options?.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${userAnswer === option ? 'selected' : ''} ${
                  showFeedback ? (option === question.correctAnswer ? 'correct' : userAnswer === option ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'true-false' && (
          <div className="true-false-options">
            {question.options?.map((option, index) => (
              <button
                key={index}
                className={`tf-btn ${userAnswer === option ? 'selected' : ''} ${
                  showFeedback ? (option === question.correctAnswer ? 'correct' : userAnswer === option ? 'incorrect' : '') : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'drag-drop' && (
          <div className="drag-drop-container">
            <div className="drag-items">
              {question.options?.map((item, index) => (
                <div
                  key={index}
                  className="drag-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="drop-zones">
              {['Plan', 'Growth', 'Owed', 'Value'].map((zone, index) => (
                <div
                  key={index}
                  className="drop-zone"
                  onDrop={(e) => handleDrop(e, zone)}
                  onDragOver={handleDragOver}
                >
                  <span className="zone-label">{zone}</span>
                  {dropZones[zone] && (
                    <div className="dropped-item">{dropZones[zone]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showFeedback && (
          <div className={`feedback ${isCorrect() ? 'correct' : 'incorrect'}`}>
            <div className="feedback-header">
              <span className="feedback-icon">{isCorrect() ? '✅' : '❌'}</span>
              <span className="feedback-text">{isCorrect() ? t.correct : t.incorrect}</span>
            </div>
            {question.explanation && (
              <div className="explanation">
                <strong>{t.explanation}:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <button
          onClick={handleNext}
          className="btn primary"
          disabled={!userAnswer}
        >
          {currentQuestion === questions.length - 1 ? t.submit : t.next}
        </button>
      </div>
    </div>
  );
};

export default InteractiveQuiz;