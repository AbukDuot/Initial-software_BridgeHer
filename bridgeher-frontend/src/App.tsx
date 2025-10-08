import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Community from "./pages/Community";
import LearnerDashboard from "./pages/LearnerDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import Mentorship from "./pages/Mentorship";
import Settings from "./pages/Settings";
import MyCertificates from "./pages/MyCertificates";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseDetail from "./pages/CourseDetail";
import ModuleDetail from "./pages/ModuleDetail";
import Quiz from "./pages/Quiz"; 

import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppProvider, useAppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


const OfflineBanner: React.FC = () => {
  const { isOnline } = useAppContext();
  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: "#b91c1c",
        color: "white",
        textAlign: "center",
        padding: "10px 0",
        fontWeight: "500",
      }}
    >
      You’re currently offline — showing saved data.
    </div>
  );
};


function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <UserProvider>
          <Router>
            <Navbar />
            <OfflineBanner />

            <main className="flex-grow-1">
              <Routes>
                {/* Main Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/course/:id/module/:moduleId" element={<ModuleDetail />} />
                <Route path="/course/:id/module/:moduleId/quiz" element={<Quiz />} /> 
                <Route path="/quiz/:id" element={<Quiz />} /> 

                <Route path="/learner-dashboard" element={<LearnerDashboard />} />
                <Route path="/mentor-dashboard" element={<MentorDashboard />} />

                {/* User & Settings */}
                <Route path="/mentorship" element={<Mentorship />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-certificates" element={<MyCertificates />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>

            <Footer />
          </Router>
        </UserProvider>
      </LanguageProvider>
    </AppProvider>
  );
}

export default App;
