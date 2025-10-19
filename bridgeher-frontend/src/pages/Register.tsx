import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/auth.css";

const Register: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Learner",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert(isArabic ? "كلمات المرور غير متطابقة!" : "Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert(isArabic ? "تم التسجيل بنجاح 🎉" : "Registration successful 🎉");
        localStorage.setItem("token", data.token);
        window.location.href = "/login";
      } else {
        alert(isArabic ? `خطأ: ${data.message}` : `Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert(isArabic ? "فشل الاتصال بالخادم!" : "Failed to connect to server!");
    }
  };

  return (
    <div className={`auth-page ${isArabic ? "rtl" : ""}`}>
      <div className="auth-card">
        <h2>{isArabic ? "إنشاء حساب جديد" : "Create an Account"}</h2>
        <p>{isArabic ? "انضم إلى BridgeHer لتطوير مهاراتك الرقمية" : "Join BridgeHer to grow your digital skills"}</p>

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>{isArabic ? "جارٍ المعالجة..." : "Processing..."}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              name="name"
              placeholder={isArabic ? "الاسم الكامل" : "Full Name"}
              value={form.name}
              onChange={handleChange}
              required
            />
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
            <input
              type="password"
              name="confirmPassword"
              placeholder={isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="Learner">{isArabic ? "متعلم" : "Learner"}</option>
              <option value="Mentor">{isArabic ? "مرشد" : "Mentor"}</option>
            </select>

            <button type="submit" className="btn primary-btn">
              {isArabic ? "تسجيل" : "Register"}
            </button>
          </form>
        )}

        <div className="divider">
          <span>{isArabic ? "أو" : "or"}</span>
        </div>

        {/*  Social Login Buttons with Icons */}
        <div className="social-login">
          <button className="btn google">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="social-icon"
            />
            {isArabic ? "التسجيل باستخدام Google" : "Sign up with Google"}
          </button>

          <button className="btn facebook">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
              alt="Facebook"
              className="social-icon"
            />
            {isArabic ? "التسجيل باستخدام Facebook" : "Sign up with Facebook"}
          </button>
        </div>

        <p className="auth-footer">
          {isArabic ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link to="/login">{isArabic ? "تسجيل الدخول" : "Login"}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
