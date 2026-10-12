import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getErrorMessage } from "../utils/errorHandler";
import api from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoggingIn(true);
    setMessage("");

    try {
      const response = await api.post("/login/", {
        username: username,
        password: password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      navigate("/dashboard");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">🚀</div>

          <p className="eyebrow">ISSUE TRACKER</p>

          <h1>Welcome back</h1>

          <p>Sign in to manage your projects, tasks, and discussions.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {message && <p className="form-error login-error">{message}</p>}

          <button
            type="submit"
            className="button button-primary login-button"
            disabled={loggingIn}
          >
            {loggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">Issue Tracker · Project Management</p>
      </section>
    </main>
  );
}

export default Login;
