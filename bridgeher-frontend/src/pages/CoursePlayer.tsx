import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getOfflineCourse, isCourseOffline } from "../utils/offline";
import { API_BASE_URL } from "../config/api";
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
  const [offlineMode, setOfflineMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadCourse();
    checkOfflineStatus();
  }, [courseId]);

  const checkOfflineStatus = () => {
    if (courseId && isCourseOffline(Number(courseId))) {
      setOfflineMode(true);
      const offlineData = getOfflineCourse(Number(courseId));
      if (offlineData?.modules) {
        setModules(offlineData.modules);
        if (offlineData.modules.length > 0) {
          setCurrentModule(offlineData.modules[0]);
        }
      }
    }
  };

  const loadCourse = async () => {
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
      
      alert("Module marked as complete!");
      
      const nextModule = modules.find(m => m.order_index === currentModule.order_index + 1);
      if (nextModule) selectModule(nextModule);
    } catch (err) {
      console.error("Failed to mark complete", err);
    }
  };

  const downloadForOffline = async () => {
    if (!currentModule || !courseId) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/offline/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      const { saveCourseOffline } = await import("../utils/offline");
      saveCourseOffline(Number(courseId), data);
      
      await fetch(`${API_BASE_URL}/api/offline/download/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert("Course downloaded for offline access!");
      setOfflineMode(true);
    } catch (err) {
      console.error("Failed to download", err);
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
              
              {!offlineMode && currentModule.video_url ? (
                currentModule.video_url.startsWith('http') ? (
                  <iframe
                    width="100%"
                    height="500"
                    src={currentModule.video_url}
                    title={currentModule.title}
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls
                    onTimeUpdate={handleVideoProgress}
                    src={`${API_BASE_URL}${currentModule.video_url}`}
                  />
                )
              ) : (
                <div className="offline-content">
                  <p>Video not available offline</p>
                </div>
              )}
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p>Progress: {progress}%</p>

              <div className="actions">
                <button onClick={markComplete} className="complete-btn">Mark Complete</button>
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
                  <h2>📄 Course Materials</h2>
                  <a 
                    href={`${API_BASE_URL}/api/modules/${currentModule.id}/pdf`}
                    download
                    className="pdf-download-btn"
                  >
                    Download PDF
                  </a>
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
      </div>
    </div>
  );
};

export default CoursePlayer;
