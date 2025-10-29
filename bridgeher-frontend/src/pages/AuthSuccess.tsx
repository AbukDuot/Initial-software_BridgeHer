import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Authenticating...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
};

export default AuthSuccess;
