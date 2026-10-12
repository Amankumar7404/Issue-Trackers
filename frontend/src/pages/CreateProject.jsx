import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function CreateProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Project title is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await api.post("/projects/", {
        title: title.trim(),
        description: description.trim(),
      });

      navigate("/dashboard");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="container form-container">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <section className="form-card">
          <div className="form-header">
            <div className="form-icon">📁</div>

            <div>
              <p className="eyebrow">NEW PROJECT</p>

              <h1 className="form-title">Create Project</h1>

              <p className="form-subtitle">
                Create a project to organize your issues and tasks.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="project-title">Project Title</label>

              <input
                id="project-title"
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Issue Tracker"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Description</label>

              <textarea
                id="project-description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project is about..."
                rows="6"
              />
            </div>

            {message && (
              <p
                className={
                  message.includes("successfully")
                    ? "form-success"
                    : "form-error"
                }
              >
                {message}
              </p>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default CreateProject;
