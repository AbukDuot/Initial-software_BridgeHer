import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setStatus('success');
      setTimeout(() => navigate("/"), 1500);
    } else {
      setStatus('error');
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {status === 'loading' && (
          <>
            <div className="loading-spinner"></div>
            <h2>Authenticating...</h2>
            <p>Please wait while we log you in.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Success!</h2>
            <p>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Authentication Failed</h2>
            <p>Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;
