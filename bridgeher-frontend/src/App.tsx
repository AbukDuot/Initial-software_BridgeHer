import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Community from "./pages/Community";
import CreateTopic from "./pages/CreateTopic";
import LearnerDashboard from "./pages/LearnerDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourseUpload from "./pages/AdminCourseUpload";
import CoursePlayer from "./pages/CoursePlayer";
import ResetPassword from "./pages/ResetPassword";
import Mentorship from "./pages/Mentorship";
import Settings from "./pages/Settings";
import MyCertificates from "./pages/MyCertificates";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthSuccess from "./pages/AuthSuccess";
import Profile from "./pages/Profile";
import CourseDetail from "./pages/CourseDetail";
import ModuleDetail from "./pages/ModuleDetail";
import Quiz from "./pages/quiz";
import HelpFAQ from "./pages/HelpFAQ";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TopicDetail from "./pages/TopicDetail";

import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppProvider, useAppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ErrorBoundary from "./components/ErrorBoundary";
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
    <ErrorBoundary>
      <AppProvider>
        <LanguageProvider>
          <UserProvider>
            <Router>
            <Navbar />
            <OfflineBanner />
            <CookieBanner language="English" />

            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/create" element={<CreateTopic />} />
                <Route path="/community/topic/:id" element={<TopicDetail />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route
                  path="/course/:id/module/:moduleId"
                  element={<ModuleDetail />}
                />
                <Route
                  path="/course/:id/module/:moduleId/quiz"
                  element={<Quiz />}
                />
                <Route path="/quiz/:id" element={<Quiz />} />
                <Route
                  path="/learner-dashboard"
                  element={<LearnerDashboard />}
                />
                <Route path="/mentor-dashboard" element={<MentorDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-course-upload" element={<AdminCourseUpload />} />
                <Route path="/course-player/:courseId" element={<CoursePlayer />} />
                <Route path="/mentorship" element={<Mentorship />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-certificates" element={<MyCertificates />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/help" element={<HelpFAQ />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
              </Routes>
            </main>

            <Footer />
            </Router>
          </UserProvider>
        </LanguageProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
