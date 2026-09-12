import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Task title is required.");
      return;
    }

    if (!dueDate) {
      setMessage("Due date is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await api.post("/tasks/", {
        project: Number(projectId),
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate,
      });

      console.log("TASK CREATED:", response.data);

      setMessage("Task created successfully! ✅");

      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 600);
    } catch (error) {
      console.log("CREATE TASK ERROR:", error);
      console.log("RESPONSE:", error.response);

      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="container form-container task-form-container">
        <button
          className="back-button"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          ← Back to Project
        </button>

        <section className="form-card">
          <div className="form-header">
            <div className="form-icon">📋</div>

            <div>
              <p className="eyebrow">NEW TASK</p>

              <h1 className="form-title">Create Task</h1>

              <p className="form-subtitle">Add a new task to this project.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* TITLE */}
            <div className="form-group">
              <label htmlFor="task-title">Task Title</label>

              <input
                id="task-title"
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix login authentication"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label htmlFor="task-description">Description</label>

              <textarea
                id="task-description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                rows="6"
              />
            </div>

            {/* STATUS + PRIORITY */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-status">Status</label>

                <select
                  id="task-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>

                <select
                  id="task-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            {/* DUE DATE */}
            <div className="form-group">
              <label htmlFor="task-due-date">Due Date</label>

              <input
                id="task-due-date"
                className="form-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* MESSAGE */}
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

            {/* ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default CreateTask;
