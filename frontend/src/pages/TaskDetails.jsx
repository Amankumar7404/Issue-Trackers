import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [message, setMessage] = useState("Loading task...");

  // Comments
  const [comment, setComment] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Task delete
  const [deleting, setDeleting] = useState(false);

  // Comment edit
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}/`);

        setTask(response.data);
        setMessage("");
      } catch (error) {
        setMessage(getErrorMessage(error));
      }
    };

    fetchTask();
  }, [id]);

  const refreshTask = async (isCommentAction = false) => {
    try {
      const response = await api.get(`/tasks/${id}/`);

      setTask(response.data);
      setMessage("");
    } catch (error) {
      if (isCommentAction) {
        setCommentMessage(getErrorMessage(error));
      } else {
        setMessage(getErrorMessage(error));
      }
    }
  };

  // ADD COMMENT
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setCommentMessage("Comment cannot be empty.");
      return;
    }

    setAddingComment(true);
    setCommentMessage("");

    try {
      await api.post("/comments/", {
        task: Number(id),
        content: comment.trim(),
      });

      setComment("");
      setCommentMessage("Comment added successfully! ✅");

      await refreshTask(true);
    } catch (error) {
      setCommentMessage(getErrorMessage(error));
    } finally {
      setAddingComment(false);
    }
  };

  // DELETE TASK
  const handleDeleteTask = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/tasks/${id}/`);

      alert("Task deleted successfully! ✅");

      navigate(`/projects/${task.project}`);
    } catch (error) {
      alert(getErrorMessage(error));
      setDeleting(false);
    }
  };

  // EDIT COMMENT
  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      setCommentMessage("Comment cannot be empty.");
      return;
    }

    try {
      await api.patch(`/comments/${commentId}/`, {
        content: editingCommentText.trim(),
      });

      setEditingCommentId(null);
      setEditingCommentText("");
      setCommentMessage("Comment updated successfully! ✅");

      await refreshTask();
    } catch (error) {
      setCommentMessage(getErrorMessage(error));
    }
  };

  // DELETE COMMENT
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}/`);

      setCommentMessage("Comment deleted successfully! ✅");

      await refreshTask();
    } catch (error) {
      setCommentMessage(getErrorMessage(error));
    }
  };

  if (message) {
    return (
      <main className="page">
        <div className="container">
          <div className="state-card">
            <div className="state-icon">⏳</div>
            <p>{message}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <button
          className="back-button"
          onClick={() => navigate(`/projects/${task.project}`)}
        >
          ← Back to Project
        </button>

        {/* TASK HEADER */}
        <section className="detail-card task-detail-card">
          <div className="task-detail-header">
            <div>
              <p className="eyebrow">TASK</p>

              <h1 className="detail-title">{task.title}</h1>
            </div>

            <span
              className={`badge ${
                task.status === "DONE"
                  ? "badge-success"
                  : task.status === "IN_PROGRESS"
                    ? "badge-warning"
                    : "badge-neutral"
              }`}
            >
              {task.status}
            </span>
          </div>

          {/* TASK DESCRIPTION */}
          <p className="detail-description">
            {task.description || "No description provided."}
          </p>

          {/* TASK METADATA */}
          <div className="task-detail-meta">
            <div className="meta-item">
              <span className="meta-label">Priority</span>
              <strong>{task.priority}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Due Date</span>
              <strong>{task.due_date}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Created</span>
              <strong>{new Date(task.created_at).toLocaleDateString()}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Updated</span>
              <strong>{new Date(task.updated_at).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* TASK ACTIONS */}
          <div className="action-row">
            <button
              className="button button-secondary"
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              ✏️ Edit Task
            </button>

            <button
              className="button button-danger"
              onClick={handleDeleteTask}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "🗑️ Delete Task"}
            </button>
          </div>
        </section>

        {/* COMMENTS */}
        <section className="comments-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">DISCUSSION</p>

              <div className="section-heading">
                <h2>Comments</h2>

                <span className="badge badge-primary">
                  {task.comments?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* COMMENT LIST */}
          {task.comments?.map((comment) => (
            <article key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="avatar">
                    {comment.author
                      ? comment.author.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <strong>{comment.author}</strong>

                    <small>
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>

              {/* EDITING COMMENT */}
              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    className="form-textarea"
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    rows="4"
                  />

                  <div className="action-row">
                    <button
                      className="button button-primary"
                      onClick={() => handleEditComment(comment.id)}
                    >
                      Save
                    </button>

                    <button
                      className="button button-secondary"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingCommentText("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* COMMENT CONTENT */}
                  <p className="comment-content">{comment.content}</p>

                  {/* COMMENT ACTIONS */}
                  <div className="action-row">
                    <button
                      className="button button-secondary"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingCommentText(comment.content);
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="button button-danger"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}

          {/* ADD COMMENT */}
          <div className="comment-form-card">
            <h3>Add a Comment</h3>

            <form onSubmit={handleAddComment}>
              <textarea
                className="form-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment..."
                rows="5"
              />

              <div className="comment-form-footer">
                {commentMessage && (
                  <p
                    className={
                      commentMessage.includes("successfully")
                        ? "form-success"
                        : "form-error"
                    }
                  >
                    {commentMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={addingComment}
                >
                  {addingComment ? "Adding..." : "Add Comment"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TaskDetails;
