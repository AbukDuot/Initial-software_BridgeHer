import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  time_limit: number;
  passing_score: number;
  questions: Question[];
}

interface DatabaseQuizProps {
  moduleId: number;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
}

const DatabaseQuiz: React.FC<DatabaseQuizProps> = ({ moduleId, onQuizComplete, onClose }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setQuiz(data);
        setTimeLeft(data.time_limit * 60);
      } else {
        setError('No quiz found for this module');
      }
    } catch {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      const token = localStorage.getItem('token');
      const timeSpent = (quiz.time_limit * 60) - timeLeft;
      
      console.log('Submitting quiz:', { quizId: quiz.id, answers, timeSpent });
      
      const response = await fetch(`${API_BASE_URL}/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers, timeSpent })
      });

      console.log('Submit response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Quiz result:', result);
        setScore(result.percentage);
        setShowResult(true);
        
        setTimeout(() => {
          onQuizComplete(result.passed);
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Submit error:', errorData);
        alert('Failed to submit quiz: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
        <div style={{background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center'}}>
          <h2>Loading Quiz...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
        <div style={{background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center'}}>
          <h2>Quiz Not Available</h2>
          <p>{error}</p>
          <button onClick={onClose} style={{background: '#4A148C', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px'}}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
        <div style={{background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', textAlign: 'center'}}>
          <h2 style={{color: '#4A148C'}}>Quiz Result</h2>
          <div style={{fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: score >= 70 ? '#2E7D32' : '#E53935'}}>
            {score}%
          </div>
          <p>{score >= 70 ? ' Congratulations! You passed!' : ' You need 70% to pass'}</p>
          <button onClick={onClose} style={{background: '#4A148C', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '5px'}}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div style={{background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'}}>
        
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #4A148C', paddingBottom: '15px'}}>
          <h2 style={{color: '#4A148C', margin: 0}}>{quiz.title}</h2>
          <div style={{background: '#FFD700', color: '#4A148C', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
             {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div style={{marginBottom: '20px'}}>
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <div style={{background: '#E0E0E0', height: '8px', borderRadius: '4px', marginTop: '10px'}}>
            <div style={{background: '#4A148C', height: '100%', borderRadius: '4px', width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`}} />
          </div>
        </div>

        {/* Question */}
        <div style={{marginBottom: '30px'}}>
          <h3 style={{marginBottom: '20px'}}>{question.question}</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setAnswers(prev => ({...prev, [question.id]: option}))}
                style={{
                  display: 'flex', alignItems: 'center', padding: '15px', border: '2px solid',
                  borderColor: answers[question.id] === option ? '#4A148C' : '#CCC',
                  borderRadius: '8px', background: answers[question.id] === option ? '#F3E5F5' : 'white',
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <span style={{background: answers[question.id] === option ? '#4A148C' : '#CCC', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '14px', fontWeight: 'bold'}}>
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
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            style={{background: currentQuestion === 0 ? '#CCC' : '#6C757D', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'}}
          >
            Previous
          </button>

          <button
            onClick={() => {
              if (currentQuestion < quiz.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!answers[question.id]}
            style={{background: answers[question.id] ? '#4A148C' : '#CCC', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: answers[question.id] ? 'pointer' : 'not-allowed'}}
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseQuiz;