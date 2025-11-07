import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const About = lazy(() => import("./pages/About"));
const Community = lazy(() => import("./pages/Community"));
const CreateTopic = lazy(() => import("./pages/CommunityCreate"));
const LearnerDashboard = lazy(() => import("./pages/LearnerDashboard"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCourseUpload = lazy(() => import("./pages/AdminCourseUpload"));
const CoursePlayer = lazy(() => import("./pages/CoursePlayer"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Settings = lazy(() => import("./pages/Settings"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AuthSuccess = lazy(() => import("./pages/AuthSuccess"));
const Profile = lazy(() => import("./pages/Profile"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));
const Quiz = lazy(() => import("./pages/quiz"));
const HelpFAQ = lazy(() => import("./pages/HelpFAQ"));
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard"));
const TopicDetail = lazy(() => import("./pages/TopicDetail"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppProvider, useAppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import FeatureTest from "./components/FeatureTest";
const OfflineBanner: React.FC = () => {
  const { isOnline } = useAppContext();
  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: "#E53935",
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
            <OfflineIndicator />
            <OfflineBanner />
            <CookieBanner language="English" />

            <main className="flex-grow-1">
              {process.env.NODE_ENV === 'development' && <FeatureTest />}
              <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}>Loading...</div>}>
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
                <Route path="/admin-reports" element={<AdminReports />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
              </Suspense>
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
