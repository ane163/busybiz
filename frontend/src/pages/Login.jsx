import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error("The server returned an incomplete login response.");
      }

      login(user, token);
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : error.message === "Network Error"
            ? "Cannot connect to BusyBiz. Make sure the backend is running on port 5000."
            : "Login failed. Please check your email and password.");

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back to BusyBiz</h1>
        <p>Sign in to manage your business.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{textAlign:"center",margin:"16px 0 0"}}><button type="button" onClick={() => navigate("/")} style={{border:0,background:"none",color:"#888",cursor:"pointer"}}>← Continue without logging in</button></p>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={() => navigate("/register")}>
            Create account
          </button>
        </p>
      </section>

      <style>{`
        .auth-page{min-height:100vh;display:grid;place-items:center;padding:32px;background:#050505;color:#f5f5f5}
        .auth-card{width:min(100%,430px);padding:38px;border:1px solid #2b2414;border-radius:18px;background:#0d0d0d;box-shadow:0 24px 70px rgba(0,0,0,.45)}
        .auth-card h1{margin:0 0 8px;font-size:30px;color:#d4af37}
        .auth-card>p{margin:0 0 28px;color:#aaa}
        .auth-field{margin-bottom:18px}.auth-field label{display:block;margin-bottom:8px;font-weight:600}
        .auth-field input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #333;border-radius:10px;background:#141414;color:#fff;outline:none}
        .auth-field input:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.12)}
        .auth-error{margin:10px 0 16px;padding:11px 12px;border:1px solid #6f2525;border-radius:9px;background:#251010;color:#ffb0b0}
        .auth-submit{width:100%;padding:13px;border:0;border-radius:10px;background:#d4af37;color:#080808;font-weight:800;cursor:pointer}
        .auth-submit:disabled{opacity:.6;cursor:not-allowed}.auth-switch{text-align:center!important;margin:22px 0 0!important}
        .auth-switch button{border:0;background:none;color:#d4af37;cursor:pointer;font-weight:700}
      `}</style>
    </main>
  );
}

export default Login;
