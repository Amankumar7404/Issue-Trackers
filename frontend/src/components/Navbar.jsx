import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <button className="navbar-brand" onClick={() => navigate("/dashboard")}>
        🚀 Issue Tracker
      </button>

      <nav className="navbar-actions">
        <button className="navbar-link" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button
          className="button button-primary"
          onClick={() => navigate("/create-project")}
        >
          + Create Project
        </button>

        <button className="button button-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
