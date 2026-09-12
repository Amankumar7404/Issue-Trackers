import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}/`);

        console.log("TASK TO EDIT:", response.data);

        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
        setStatus(response.data.status || "TODO");
        setPriority(response.data.priority || "MEDIUM");
        setDueDate(response.data.due_date || "");

        setLoading(false);
      } catch (error) {
        console.log("EDIT TASK LOAD ERROR:", error);
        console.log("RESPONSE:", error.response);

        setMessage(getErrorMessage(error));
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Task title is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await api.patch(`/tasks/${id}/`, {
        title: title.trim(),
        description: description.trim(),
        status: status,
        priority: priority,
        due_date: dueDate,
      });

      console.log("TASK UPDATED:", response.data);

      setMessage("Task updated successfully! ✅");

      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 600);
    } catch (error) {
      console.log("UPDATE TASK ERROR:", error);
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
            <p>Loading task...</p>
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
          onClick={() => navigate(`/tasks/${id}`)}
        >
          ← Back to Task
        </button>

        <section className="form-card">
          <div className="form-header">
            <div className="form-icon">✏️</div>

            <div>
              <p className="eyebrow">TASK SETTINGS</p>

              <h1 className="form-title">Edit Task</h1>

              <p className="form-subtitle">Update the task details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="task-title">Task Title</label>

              <input
                id="task-title"
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-description">Description</label>

              <textarea
                id="task-description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-status">Status</label>

              <select
                id="task-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>

              <select
                id="task-priority"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

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
                onClick={() => navigate(`/tasks/${id}`)}
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

export default EditTask;
