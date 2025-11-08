import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getOfflineCourse, isCourseOffline } from "../utils/offline";
import { API_BASE_URL } from "../config/api";

import DatabaseQuiz from "../components/DatabaseQuiz";
import "../styles/courseplayer.css";

interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  video_url: string;
  pdf_url?: string;
  duration: number;
  order_index: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
}

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState(0);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [, setOfflineMode] = useState(false);
  const [, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkOfflineStatus();
    loadCourse();
  }, [courseId]);

  const checkOfflineStatus = () => {
    if (courseId && isCourseOffline(Number(courseId))) {
      console.log(' Course is available offline!');
      setOfflineMode(true);
      const offlineData = getOfflineCourse(Number(courseId));
      console.log('Offline data:', offlineData);
      if (offlineData?.modules) {
        setModules(offlineData.modules);
        if (offlineData.modules.length > 0) {
          setCurrentModule(offlineData.modules[0]);
        }
      }
    } else {
      console.log(' Course not available offline');
    }
  };

  const loadCourse = async () => {
    
    if (!navigator.onLine && courseId && isCourseOffline(Number(courseId))) {
      console.log('Loading from offline storage...');
      const offlineData = getOfflineCourse(Number(courseId));
      if (offlineData?.modules) {
        setModules(offlineData.modules);
        if (offlineData.modules.length > 0) {
          setCurrentModule(offlineData.modules[0]);
        }
        setOfflineMode(true);
      }
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const modulesRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData);
        if (modulesData.length > 0) {
          setCurrentModule(modulesData[0]);
          loadAssignments(modulesData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load course", err);
     
      if (courseId && isCourseOffline(Number(courseId))) {
        console.log(' Network failed, loading from offline storage...');
        const offlineData = getOfflineCourse(Number(courseId));
        if (offlineData?.modules) {
          setModules(offlineData.modules);
          if (offlineData.modules.length > 0) {
            setCurrentModule(offlineData.modules[0]);
          }
          setOfflineMode(true);
        }
      }
    }
  };

  const loadAssignments = async (moduleId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/assignments/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to load assignments", err);
    }
  };

  const selectModule = (module: Module) => {
    setCurrentModule(module);
    loadAssignments(module.id);
    setProgress(0);
  };

  const markComplete = async () => {
    if (!currentModule || !courseId) return;
    setShowQuiz(true);
  };
  
  const handleQuizComplete = async (passed: boolean) => {
    if (!currentModule || !courseId) return;
    
    if (passed) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/api/modules/${currentModule.id}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: true, time_spent: Math.floor(videoRef.current?.currentTime || 0) }),
        });
        
        const completedCount = modules.filter(m => m.id <= currentModule.id).length;
        const progressPercent = Math.floor((completedCount / modules.length) * 100);
        
        const { saveProgress } = await import("../utils/offline");
        saveProgress(Number(courseId), progressPercent, completedCount);
        
        alert("Module completed successfully!");
        setShowQuiz(false);
        
        const nextModule = modules.find(m => m.order_index === currentModule.order_index + 1);
        if (nextModule) selectModule(nextModule);
      } catch (err) {
        console.error("Failed to mark complete", err);
      }
    } else {
      alert("You must pass the quiz to complete this module. Try again!");
    }
  };

  const downloadForOffline = async () => {
    if (!courseId) return;
    
    try {
      const token = localStorage.getItem("token");
      
  
      const modulesRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!modulesRes.ok) throw new Error('Failed to fetch modules');
      const modulesData = await modulesRes.json();
      
     
      const { saveCourseOffline } = await import("../utils/offline");
      const saved = saveCourseOffline(Number(courseId), {
        modules: modulesData,
        downloadedAt: new Date().toISOString()
      });
      
      if (!saved) throw new Error('Failed to save offline');
      
      console.log(' Saved to localStorage:', {
        courseId,
        moduleCount: modulesData.length,
        storage: localStorage.getItem('bridgeher_offline_courses')
      });
      
      
      try {
        await fetch(`${API_BASE_URL}/api/offline/download/${courseId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        console.log('Backend tracking failed, but offline save succeeded');
      }
      
      alert("Course downloaded successfully!\n\n  To test offline mode:\n1. Open DevTools (F12)\n2. Go to Network tab\n3. Check 'Offline' checkbox\n4. Refresh this page\n\nThe course will load from cache!");
      setOfflineMode(true);
    } catch (err) {
      console.error("Failed to download", err);
      alert(" Download failed: " + (err as Error).message);
    }
  };

  const submitAssignment = async (assignmentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", submissionText);
      if (submissionFile) formData.append("file", submissionFile);
      
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (res.ok) {
        alert("Assignment submitted successfully!");
        setSubmissionText("");
        setSubmissionFile(null);
      }
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(Math.floor(percent));
      setCurrentTime(videoRef.current.currentTime);
      
      
      if (percent >= 90 && !videoCompleted) {
        setVideoCompleted(true);
      }
    }
  };



  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="course-player">
      <div className="sidebar">
        <h2>Modules</h2>
        {modules.map((mod) => (
          <div
            key={mod.id}
            className={`module-item ${currentModule?.id === mod.id ? "active" : ""}`}
            onClick={() => selectModule(mod)}
          >
            <span>{mod.order_index + 1}. {mod.title}</span>
            <span className="duration">{mod.duration}min</span>
          </div>
        ))}
      </div>

      <div className="main-content">
        {currentModule && (
          <>
            <div className="video-section">
              <h1>{currentModule.title}</h1>
              
              {currentModule.video_url ? (
                currentModule.video_url.includes('youtube.com') || currentModule.video_url.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="500"
                    src={currentModule.video_url.includes('embed') ? currentModule.video_url : currentModule.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={currentModule.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    width="100%"
                    height="500"
                    controls
                    onTimeUpdate={handleVideoProgress}
                    onEnded={() => setVideoCompleted(true)}
                    src={currentModule.video_url.startsWith('http') ? currentModule.video_url : `${API_BASE_URL}${currentModule.video_url}`}
                  />
                )
              ) : (
                <div className="no-video">
                  <p>No video available</p>
                </div>
              )}
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p>Progress: {progress}%</p>

              <div className="video-controls">
                <label>Playback Speed: </label>
                <select value={playbackSpeed} onChange={(e) => handleSpeedChange(Number(e.target.value))}>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              <div className="actions">
                {videoCompleted && (
                  <div style={{background: '#E8F5E8', padding: '15px', borderRadius: '8px', margin: '10px 0', textAlign: 'center'}}>
                    <p style={{color: '#2E7D32', fontWeight: 'bold', margin: '0 0 10px 0'}}> Video Complete! Take the quiz to finish this module.</p>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowQuiz(true)}
                  style={{
                    background: '#FFD700',
                    color: '#4A148C',
                    border: '3px solid #4A148C',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    margin: '10px'
                  }}
                >
                  TAKE QUIZ
                </button>
                
                <button onClick={markComplete} className="complete-btn">Complete Module (Quiz Required)</button>
                <button onClick={downloadForOffline} className="download-btn">Download for Offline</button>
              </div>
              

            </div>

            <div className="content-section">
              <h2>Description</h2>
              <p>{currentModule.description}</p>
              
              <h2>Content</h2>
              <div className="text-content">{currentModule.content}</div>
              
              {currentModule.pdf_url && (
                <div className="pdf-section">
                  <h2> Course Materials</h2>
                  <button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_BASE_URL}/api/modules/${currentModule.id}/pdf`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                          const contentType = res.headers.get('content-type');
                          if (contentType && contentType.includes('application/json')) {
                            const data = await res.json();
                            if (data.url) {
                              window.open(data.url, '_blank');
                            }
                          } else {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${currentModule.title}.pdf`;
                            a.click();
                          }
                        }
                      } catch {
                        alert('Failed to download PDF');
                      }
                    }}
                    className="pdf-download-btn"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            <div className="assignments-section">
              <h2>Assignments</h2>
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p className="due-date">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  
                  <textarea
                    placeholder="Your answer..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                  
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  />
                  
                  <button onClick={() => submitAssignment(assignment.id)} className="submit-btn">
                    Submit Assignment
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Quiz Modal */}
        {showQuiz && currentModule && (
          <DatabaseQuiz
            moduleId={currentModule.id}
            onQuizComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
