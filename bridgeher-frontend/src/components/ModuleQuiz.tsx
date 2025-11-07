import React, { useState, useEffect } from 'react';
import './ModuleQuiz.css';

interface Question {
  id: number;
  question: string;
  question_type: string;
  options: string[];
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  questions: Question[];
}

interface QuizResult {
  passed: boolean;
  percentage: number;
  score: number;
  totalPoints: number;
}

interface ModuleQuizProps {
  moduleId: number;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
}

const ModuleQuiz: React.FC<ModuleQuizProps> = ({ moduleId, onQuizComplete, onClose }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !result) {
      handleSubmit();
    }
  }, [timeLeft, result, quiz]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        setTimeLeft(data.time_limit * 60); 
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeSpent = (quiz.time_limit * 60) - timeLeft;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers, timeSpent })
      });
      
      if (response.ok) {
        const result = await response.json();
        setResult(result);
        onQuizComplete(result.passed);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="quiz-modal">
        <div className="quiz-content">
          <div className="loading">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-modal">
        <div className="quiz-content">
          <div className="quiz-result">
            <h2>Quiz Complete!</h2>
            <div className={`score ${result.passed ? 'passed' : 'failed'}`}>
              {result.percentage}% ({result.score}/{result.totalPoints} points)
            </div>
            <p>{result.passed ? 'Congratulations! You passed!' : 'You need 70% to pass. Try again!'}</p>
            <button onClick={onClose} className="close-btn">Continue</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal">
      <div className="quiz-content">
        <div className="quiz-header">
          <h2>{quiz.title}</h2>
          <div className="timer"> {formatTime(timeLeft)}</div>
        </div>
        
        <div className="quiz-body">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="question">
              <h3>Question {index + 1} ({question.points} points)</h3>
              <p>{question.question}</p>
              
              <div className="options">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="option">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      checked={answers[question.id] === option}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="quiz-footer">
          <button onClick={handleSubmit} disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleQuiz;