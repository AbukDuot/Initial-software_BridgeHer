import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";

const Login: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";

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
    setTimeout(() => {
      setLoading(false);
      alert(isArabic ? "تم تسجيل الدخول بنجاح 🎉" : "Login successful 🎉");
    }, 2000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      alert(isArabic ? "الرجاء إدخال بريد إلكتروني صالح!" : "Please enter a valid email!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        isArabic
          ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${resetEmail}`
          : `A reset link has been sent to ${resetEmail}`
      );
      setShowReset(false);
      setResetEmail("");
    }, 2000);
  };

  return (
    <div className={`auth-page ${isArabic ? "rtl" : ""}`}>
      <div className="auth-card">
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p className="loading-text">
              {isArabic ? "جارٍ المعالجة..." : "Processing..."}
            </p>
          </div>
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

            <div className="divider">
              <span>{isArabic ? "أو" : "or"}</span>
            </div>

            <div className="social-login">
              <button className="btn google">
                {isArabic ? "تسجيل الدخول باستخدام Google" : "Login with Google"}
              </button>
              <button className="btn facebook">
                {isArabic ? "تسجيل الدخول باستخدام Facebook" : "Login with Facebook"}
              </button>
            </div>

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
