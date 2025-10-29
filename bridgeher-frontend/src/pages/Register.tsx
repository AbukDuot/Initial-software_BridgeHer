import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import TermsModal from "../components/TermsModal";
import { API_BASE_URL } from "../config/api";
import "../styles/auth.css";

const Register: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "Arabic";
  const { toasts, showToast, removeToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Learner",
  });

  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast(isArabic ? "كلمات المرور غير متطابقة!" : "Passwords do not match!", "error");
      return;
    }

    if (!termsAccepted) {
      showToast(isArabic ? "يجب الموافقة على الشروط والأحكام" : "You must accept the Terms & Conditions", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        showToast(isArabic ? "تم التسجيل بنجاح!" : "Registration successful!", "success");
        localStorage.setItem("token", data.token);
        setTimeout(() => window.location.href = "/login", 1500);
      } else {
        showToast(isArabic ? `خطأ: ${data.message}` : `Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      showToast(isArabic ? "فشل الاتصال بالخادم!" : "Failed to connect to server!", "error");
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
        <h2>{isArabic ? "إنشاء حساب جديد" : "Create an Account"}</h2>
        <p>{isArabic ? "انضم إلى BridgeHer لتطوير مهاراتك الرقمية" : "Join BridgeHer to grow your digital skills"}</p>

        {loading ? (
          <LoadingSpinner 
            size="medium" 
            message={isArabic ? "جارٍ المعالجة..." : "Processing..."}
          />
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
              type="tel"
              name="phone"
              placeholder={isArabic ? "رقم الهاتف (اختياري)" : "Phone Number (optional)"}
              value={form.phone}
              onChange={handleChange}
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
              <option value="Admin">{isArabic ? "مسؤول" : "Admin"}</option>
            </select>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">
                {isArabic ? "أوافق على " : "I agree to the "}
                <span className="terms-link" onClick={() => setShowTermsModal(true)}>
                  {isArabic ? "الشروط والأحكام" : "Terms & Conditions"}
                </span>
              </label>
            </div>

            <button type="submit" className="btn primary-btn">
              {isArabic ? "تسجيل" : "Register"}
            </button>
          </form>
        )}

        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
          }}
          language={language}
        />

        <p className="auth-footer">
          {isArabic ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link to="/login">{isArabic ? "تسجيل الدخول" : "Login"}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
