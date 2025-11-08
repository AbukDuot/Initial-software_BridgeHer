import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useUser } from "../hooks/useUser";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_BASE_URL } from "../config/api";
import "../styles/auth.css";

const Login: React.FC = () => {
  const { language } = useLanguage();
  const { setUser } = useUser();
  const isArabic = language === "Arabic";
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      alert(isArabic ? "الرجاء إدخال بريد إلكتروني صالح!" : "Please enter a valid email!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        console.log('🔑 Login response:', data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        showToast(isArabic ? "تم تسجيل الدخول بنجاح 🎉" : "Login successful!", "success");
        
        const role = (data.user.role || '').toLowerCase();
        console.log('🔑 User role:', role);
        const redirectPath = role === "admin" ? "/admin-dashboard" : role === "mentor" ? "/mentor-dashboard" : "/learner-dashboard";
        console.log('🔑 Redirecting to:', redirectPath);
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        showToast(isArabic ? `خطأ: ${data.message}` : `Error: ${data.message}`, "error");
      }
    } catch {
      setLoading(false);
      showToast(isArabic ? "فشل الاتصال بالخادم!" : "Failed to connect to server!", "error");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      alert(isArabic ? "الرجاء إدخال بريد إلكتروني صالح!" : "Please enter a valid email!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      setLoading(false);
      if (response.ok) {
        showToast(
          isArabic
            ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${resetEmail}`
            : `Reset link sent to ${resetEmail}. Check your email!`,
          "success"
        );
        setShowReset(false);
        setResetEmail("");
      } else {
        const data = await response.json();
        showToast(data.message || (isArabic ? "فشل الإرسال" : "Failed to send"), "error");
      }
    } catch {
      setLoading(false);
      showToast(isArabic ? "خطأ في الاتصال" : "Connection error", "error");
    }
  };

  return (
    <div className={`auth-page ${isArabic ? "rtl" : ""}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <div className="auth-card">
        {loading ? (
          <LoadingSpinner 
            size="medium" 
            message={isArabic ? "جارٍ المعالجة..." : "Processing..."}
          />
        ) : !showReset ? (
          <>
            <h2>{isArabic ? "تسجيل الدخول" : "Login"}</h2>
            <p>{isArabic ? "مرحبًا بعودتك إلى BridgeHer" : "Welcome back to BridgeHer"}</p>

            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="email"
                name="email"
                placeholder={isArabic ? "البريد الإلكتروني" : "Email"}
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={isArabic ? "كلمة المرور" : "Password"}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn primary-btn">
                {isArabic ? "تسجيل الدخول" : "Login"}
              </button>
            </form>

            <p className="forgot-link" onClick={() => setShowReset(true)}>
              {isArabic ? "هل نسيت كلمة المرور؟" : "Forgot Password?"}
            </p>

            <p className="auth-footer">
              {isArabic ? "ليس لديك حساب؟" : "Don’t have an account?"}{" "}
              <Link to="/register">{isArabic ? "إنشاء حساب" : "Register"}</Link>
            </p>
          </>
        ) : (
          <>
            <h2>{isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password"}</h2>
            <p>
              {isArabic
                ? "أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور."
                : "Enter your email to receive a password reset link."}
            </p>

            <form onSubmit={handleReset} className="auth-form">
              <input
                type="email"
                placeholder={isArabic ? "البريد الإلكتروني" : "Email"}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn primary-btn">
                {isArabic ? "إرسال الرابط" : "Send Reset Link"}
              </button>
            </form>

            <p className="back-to-login" onClick={() => setShowReset(false)}>
              {isArabic ? "العودة إلى تسجيل الدخول" : "Back to Login"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
