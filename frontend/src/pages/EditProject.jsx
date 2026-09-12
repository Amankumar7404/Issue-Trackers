import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}/`);

        console.log("PROJECT TO EDIT:", response.data);

        setTitle(response.data.title || "");
        setDescription(response.data.description || "");

        setLoading(false);
      } catch (error) {
        console.log("EDIT PROJECT LOAD ERROR:", error);
        console.log("RESPONSE:", error.response);

        setMessage(getErrorMessage(error));
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Project title is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await api.patch(`/projects/${id}/`, {
        title: title.trim(),
        description: description.trim(),
      });

      console.log("PROJECT UPDATED:", response.data);

      setMessage("Project updated successfully! ✅");

      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 600);
    } catch (error) {
      console.log("UPDATE PROJECT ERROR:", error);
      console.log("RESPONSE:", error.response);

      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container form-container">
          <div className="state-card">
            <div className="state-icon">⏳</div>
            <p>Loading project...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container form-container">
        <button
          className="back-button"
          onClick={() => navigate(`/projects/${id}`)}
        >
          ← Back to Project
        </button>

        <section className="form-card">
          <div className="form-header">
            <div className="form-icon">✏️</div>

            <div>
              <p className="eyebrow">PROJECT SETTINGS</p>

              <h1 className="form-title">Edit Project</h1>

              <p className="form-subtitle">
                Update the project title or description.
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
                placeholder="Project title"
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
                placeholder="Project description"
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
                onClick={() => navigate(`/projects/${id}`)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default EditProject;
