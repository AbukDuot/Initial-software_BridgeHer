import React, { useState } from "react";
import "../styles/admincourse.css";

interface Assignment {
  title: string;
  description: string;
  due_date: string;
  max_score: number;
}

interface Module {
  title: string;
  description: string;
  content: string;
  video: File | null;
  pdf: File | null;
  order_index: number;
  duration: number;
  assignment?: Assignment;
}

const AdminCourseUpload: React.FC = () => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "Technology",
    level: "Beginner",
    duration: "",
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module>({
    title: "",
    description: "",
    content: "",
    video: null,
    pdf: null,
    order_index: 0,
    duration: 0,
  });

  const [showAssignment, setShowAssignment] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment>({
    title: "",
    description: "",
    due_date: "",
    max_score: 100,
  });

  const [uploading, setUploading] = useState(false);

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentModule({ ...currentModule, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentModule({ ...currentModule, video: e.target.files[0] });
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentModule({ ...currentModule, pdf: e.target.files[0] });
    }
  };

  const addModule = () => {
    if (!currentModule.title || !currentModule.video) {
      alert("Module title and video are required");
      return;
    }
    const moduleToAdd = { 
      ...currentModule, 
      order_index: modules.length,
      assignment: showAssignment && currentAssignment.title ? currentAssignment : undefined
    };
    setModules([...modules, moduleToAdd]);
    setCurrentModule({ title: "", description: "", content: "", video: null, pdf: null, order_index: 0, duration: 0 });
    setShowAssignment(false);
    setCurrentAssignment({ title: "", description: "", due_date: "", max_score: 100 });
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const uploadCourse = async () => {
    if (!courseData.title) {
      alert("Please enter a course title");
      return;
    }
    
    if (modules.length === 0) {
      alert("Please add at least one module by clicking 'Add Module' button");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      
      const courseRes = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!courseRes.ok) throw new Error("Failed to create course");
      
      const course = await courseRes.json();

      for (const module of modules) {
        const formData = new FormData();
        formData.append("course_id", course.id);
        formData.append("title", module.title);
        formData.append("description", module.description);
        formData.append("content", module.content);
        formData.append("order_index", module.order_index.toString());
        formData.append("duration", module.duration.toString());
        if (module.video) formData.append("video", module.video);
        if (module.pdf) formData.append("pdf", module.pdf);

        const moduleRes = await fetch("http://localhost:5000/api/modules", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!moduleRes.ok) throw new Error(`Failed to upload module: ${module.title}`);
        
        if (module.assignment) {
          const moduleData = await moduleRes.json();
          await fetch("http://localhost:5000/api/assignments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              module_id: moduleData.id,
              ...module.assignment,
            }),
          });
        }
      }

      alert("Course uploaded successfully!");
      setCourseData({ title: "", description: "", category: "Technology", level: "Beginner", duration: "" });
      setModules([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-course-upload">
      <h1>Upload New Course</h1>

      <div className="course-form">
        <h2>Course Details</h2>
        <input name="title" placeholder="Course Title" value={courseData.title} onChange={handleCourseChange} />
        <textarea name="description" placeholder="Course Description" value={courseData.description} onChange={handleCourseChange} />
        
        <select name="category" value={courseData.category} onChange={handleCourseChange}>
          <option>Technology</option>
          <option>Finance</option>
          <option>Digital Literacy</option>
          <option>Financial Literacy</option>
          <option>Entrepreneurship</option>
          <option>Leadership</option>
        </select>

        <select name="level" value={courseData.level} onChange={handleCourseChange}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <input name="duration" placeholder="Duration (e.g., 4 weeks)" value={courseData.duration} onChange={handleCourseChange} />
      </div>

      <div className="module-form">
        <h2>Add Module</h2>
        <input name="title" placeholder="Module Title" value={currentModule.title} onChange={handleModuleChange} />
        <textarea name="description" placeholder="Module Description" value={currentModule.description} onChange={handleModuleChange} />
        <textarea name="content" placeholder="Module Content (Text for offline)" value={currentModule.content} onChange={handleModuleChange} />
        <input type="number" name="duration" placeholder="Duration (minutes)" value={currentModule.duration} onChange={handleModuleChange} />
        
        <div className="file-input">
          <label>Upload Video:</label>
          <input type="file" accept="video/*" onChange={handleVideoChange} />
          {currentModule.video && <span>{currentModule.video.name}</span>}
        </div>

        <div className="file-input">
          <label>Upload PDF (Optional):</label>
          <input type="file" accept=".pdf" onChange={handlePdfChange} />
          {currentModule.pdf && <span>{currentModule.pdf.name}</span>}
        </div>

        <div className="assignment-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={showAssignment} 
              onChange={(e) => setShowAssignment(e.target.checked)} 
            />
            Add Assignment/Assessment
          </label>
        </div>

        {showAssignment && (
          <div className="assignment-form">
            <h3>📝 Assignment Details</h3>
            <input 
              placeholder="Assignment Title" 
              value={currentAssignment.title}
              onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
            />
            <textarea 
              placeholder="Assignment Description/Instructions" 
              value={currentAssignment.description}
              onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
            />
            <input 
              type="datetime-local" 
              value={currentAssignment.due_date}
              onChange={(e) => setCurrentAssignment({...currentAssignment, due_date: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Max Score" 
              value={currentAssignment.max_score}
              onChange={(e) => setCurrentAssignment({...currentAssignment, max_score: Number(e.target.value)})}
            />
          </div>
        )}

        <button onClick={addModule} className="add-btn">Add Module</button>
      </div>

      <div className="modules-list">
        <h2>Modules ({modules.length})</h2>
        {modules.map((mod, idx) => (
          <div key={idx} className="module-item">
            <div>
              <span>{idx + 1}. {mod.title}</span>
              {mod.assignment && <span className="has-assignment"> 📝 Assignment</span>}
            </div>
            <button onClick={() => removeModule(idx)}>Remove</button>
          </div>
        ))}
      </div>

      <button onClick={uploadCourse} disabled={uploading} className="upload-btn">
        {uploading ? "Uploading..." : "Upload Course"}
      </button>
    </div>
  );
};

export default AdminCourseUpload;
