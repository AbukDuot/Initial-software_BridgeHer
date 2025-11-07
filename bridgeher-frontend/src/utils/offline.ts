interface CourseData {
  [key: string]: unknown;
}

interface CertificateData {
  [key: string]: unknown;
}

interface QuizAttempt {
  score: number;
  answers: number[];
  attemptedAt: string;
}

const STORAGE_KEYS = {
  COURSES: 'bridgeher_offline_courses',
  USER_PROGRESS: 'bridgeher_user_progress',
  QUIZ_ATTEMPTS: 'bridgeher_quiz_attempts',
  CERTIFICATES: 'bridgeher_certificates',
  OFFLINE_QUEUE: 'bridgeher_offline_queue',
};

export const saveCourseOffline = (courseId: number, courseData: CourseData) => {
  try {
    const courses = getOfflineCourses();
    courses[courseId] = {
      ...courseData,
      downloadedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    console.log(`✅ Course ${courseId} saved offline:`, courses[courseId]);
    return true;
  } catch (error) {
    console.error('Error saving course offline:', error);
    return false;
  }
};


export const getOfflineCourses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting offline courses:', error);
    return {};
  }
};


export const getOfflineCourse = (courseId: number) => {
  const courses = getOfflineCourses();
  return courses[courseId] || null;
};


export const removeOfflineCourse = (courseId: number) => {
  try {
    const courses = getOfflineCourses();
    delete courses[courseId];
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    return true;
  } catch (error) {
    console.error('Error removing offline course:', error);
    return false;
  }
};


export const saveProgress = (courseId: number, progress: number, completedModules: number) => {
  try {
    const progressData = getUserProgress();
    progressData[courseId] = {
      progress,
      completedModules,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progressData));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};


export const getUserProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting progress:', error);
    return {};
  }
};


export const saveQuizAttempt = (quizId: number, score: number, answers: number[]) => {
  try {
    const attempts = getQuizAttempts();
    if (!attempts[quizId]) attempts[quizId] = [];
    attempts[quizId].push({
      score,
      answers,
      attemptedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return false;
  }
};


export const getQuizAttempts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    return {};
  }
};


export const saveCertificate = (courseId: number, certificateData: CertificateData) => {
  try {
    const certificates = getCertificates();
    certificates[courseId] = {
      ...certificateData,
      issuedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    return true;
  } catch (error) {
    console.error('Error saving certificate:', error);
    return false;
  }
};

export const getCertificates = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting certificates:', error);
    return {};
  }
};


export const isCourseOffline = (courseId: number) => {
  const courses = getOfflineCourses();
  const isOffline = !!courses[courseId];
  console.log(`📱 Course ${courseId} offline status:`, isOffline);
  return isOffline;
};


export const syncOfflineData = async (apiUrl: string, token: string) => {
  try {
    const progress = getUserProgress();
    const quizAttempts = getQuizAttempts();

  
    for (const [courseId, data] of Object.entries(progress)) {
      await fetch(`${apiUrl}/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }

    
    for (const [quizId, attempts] of Object.entries(quizAttempts)) {
      const attemptsArray = attempts as QuizAttempt[];
      const lastAttempt = attemptsArray[attemptsArray.length - 1];
      await fetch(`${apiUrl}/api/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: lastAttempt.answers }),
      });
    }

    return true;
  } catch (error) {
    console.error('Error syncing offline data:', error);
    return false;
  }
};

// Clear all offline data
export const clearOfflineData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    return true;
  } catch (error) {
    console.error('Error clearing offline data:', error);
    return false;
  }
};


// Queue offline actions
export const queueOfflineAction = (action: { type: string; data: any; timestamp: string }) => {
  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
    queue.push(action);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error queuing action:', error);
    return false;
  }
};

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE) || '[]');
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return true;
  } catch (error) {
    console.error('Error clearing queue:', error);
    return false;
  }
};
