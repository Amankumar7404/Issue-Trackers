import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [message, setMessage] = useState("Loading project...");
  const [tasksLoading, setTasksLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search / Filter / Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DUE_ASC");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // ---------------------------------------
  // SEARCH DEBOUNCE
  // ---------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // ---------------------------------------
  // FETCH PROJECT
  // ---------------------------------------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setMessage("Loading project...");

        const response = await api.get(`/projects/${id}/`);

        console.log("PROJECT:", response.data);

        setProject(response.data);
        setMessage("");
      } catch (error) {
        console.log("PROJECT ERROR:", error);
        console.log("RESPONSE:", error.response);

        setMessage(getErrorMessage(error));
      }
    };

    fetchProject();
  }, [id]);

  // ---------------------------------------
  // FETCH TASKS
  // ---------------------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);

        const params = new URLSearchParams();

        // Project filter
        params.append("project", id);

        // Search
        if (debouncedSearchTerm.trim()) {
          params.append("search", debouncedSearchTerm.trim());
        }

        // Status filter
        if (statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }

        // Priority filter
        if (priorityFilter !== "ALL") {
          params.append("priority", priorityFilter);
        }

        // Sorting
        if (sortBy === "DUE_ASC") {
          params.append("ordering", "due_date");
        }

        if (sortBy === "DUE_DESC") {
          params.append("ordering", "-due_date");
        }

        if (sortBy === "PRIORITY") {
          params.append("ordering", "-priority");
        }

        if (sortBy === "NEWEST") {
          params.append("ordering", "-created_at");
        }

        if (sortBy === "OLDEST") {
          params.append("ordering", "created_at");
        }

        // Pagination
        params.append("page", currentPage);

        const response = await api.get(`/tasks/?${params.toString()}`);

        console.log("TASKS:", response.data);

        setTasks(response.data.results || []);

        setTotalTaskCount(response.data.count);

        setTotalPages(Math.ceil(response.data.count / 5));

        setHasNext(!!response.data.next);

        setHasPrevious(!!response.data.previous);
      } catch (error) {
        console.log("TASK ERROR:", error);
        console.log("RESPONSE:", error.response);

        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [
    id,
    debouncedSearchTerm,
    statusFilter,
    priorityFilter,
    sortBy,
    currentPage,
  ]);

  // ---------------------------------------
  // DELETE PROJECT
  // ---------------------------------------
  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await api.delete(`/projects/${id}/`);

      console.log("PROJECT DELETED:", id);

      alert("Project deleted successfully! ✅");

      navigate("/dashboard");
    } catch (error) {
      console.log("DELETE PROJECT ERROR:", error);
      console.log("RESPONSE:", error.response);

      alert(getErrorMessage(error));

      setDeleting(false);
    }
  };

  // ---------------------------------------
  // SEARCH CHANGE
  // ---------------------------------------
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ---------------------------------------
  // STATUS CHANGE
  // ---------------------------------------
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // ---------------------------------------
  // PRIORITY CHANGE
  // ---------------------------------------
  const handlePriorityChange = (value) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  // ---------------------------------------
  // SORT CHANGE
  // ---------------------------------------
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // ---------------------------------------
  // CLEAR FILTERS
  // ---------------------------------------
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSortBy("DUE_ASC");
    setCurrentPage(1);
  };

  // ---------------------------------------
  // INITIAL PROJECT LOADING
  // ---------------------------------------
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
        {/* BACK BUTTON */}
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        {/* ---------------------------------------
            PROJECT DETAILS
        --------------------------------------- */}
        <section className="detail-card">
          <div className="detail-header">
            <div className="detail-icon">📁</div>

            <div>
              <p className="eyebrow">PROJECT</p>

              <h1 className="detail-title">{project.title}</h1>
            </div>
          </div>

          <p className="detail-description">
            {project.description || "No description provided."}
          </p>

          <div className="metadata">
            <span>
              <strong>Created:</strong>{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </span>

            <span>
              <strong>Updated:</strong>{" "}
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
          </div>

          {/* PROJECT ACTIONS */}
          <div className="action-row">
            <button
              className="button button-primary"
              onClick={() => navigate(`/projects/${id}/edit`)}
            >
              ✏️ Edit Project
            </button>

            <button
              className="button button-danger"
              onClick={handleDeleteProject}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "🗑️ Delete Project"}
            </button>
          </div>
        </section>

        {/* ---------------------------------------
            TASKS SECTION
        --------------------------------------- */}
        <section className="tasks-section">
          {/* SECTION HEADER */}
          <div className="section-header">
            <div>
              <p className="eyebrow">WORK ITEMS</p>

              <div className="section-heading">
                <h2>Tasks</h2>

                <span className="badge badge-primary">
                  {totalTaskCount} {totalTaskCount === 1 ? "Task" : "Tasks"}
                </span>
              </div>
            </div>

            <button
              className="button button-primary"
              onClick={() => navigate(`/projects/${id}/create-task`)}
            >
              + Create Task
            </button>
          </div>

          {/* ---------------------------------------
              FILTERS
          --------------------------------------- */}
          <div className="task-filters">
            {/* SEARCH */}
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search tasks..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            {/* STATUS */}
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="ALL">All Statuses</option>

              <option value="TODO">TODO</option>

              <option value="IN_PROGRESS">IN PROGRESS</option>

              <option value="DONE">DONE</option>
            </select>

            {/* PRIORITY */}
            <select
              className="form-input"
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
            >
              <option value="ALL">All Priorities</option>

              <option value="LOW">LOW</option>

              <option value="MEDIUM">MEDIUM</option>

              <option value="HIGH">HIGH</option>
            </select>

            {/* SORT */}
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="DUE_ASC">Due Date: Earliest First</option>

              <option value="DUE_DESC">Due Date: Latest First</option>

              <option value="PRIORITY">Priority: High to Low</option>

              <option value="NEWEST">Created: Newest First</option>

              <option value="OLDEST">Created: Oldest First</option>
            </select>
          </div>

          {/* ---------------------------------------
              TASK LOADING
          --------------------------------------- */}
          {tasksLoading ? (
            <div className="state-card">
              <div className="state-icon">⏳</div>

              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            /* ---------------------------------------
               NO TASKS
            --------------------------------------- */
            <div className="state-card">
              <div className="state-icon">📋</div>

              <h3>
                {searchTerm ||
                statusFilter !== "ALL" ||
                priorityFilter !== "ALL"
                  ? "No matching tasks"
                  : "No tasks found"}
              </h3>

              <p>
                {searchTerm ||
                statusFilter !== "ALL" ||
                priorityFilter !== "ALL"
                  ? "No tasks match your current search or filters."
                  : "This project doesn't have any tasks yet. Create the first one to get started."}
              </p>

              {searchTerm ||
              statusFilter !== "ALL" ||
              priorityFilter !== "ALL" ? (
                <button
                  className="button button-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  className="button button-primary"
                  onClick={() => navigate(`/projects/${id}/create-task`)}
                >
                  + Create First Task
                </button>
              )}
            </div>
          ) : (
            /* ---------------------------------------
               TASK LIST
            --------------------------------------- */
            <>
              <div className="card-grid">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="task-card"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="task-card-top">
                      <h3>{task.title}</h3>

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

                    <p className="task-description">
                      {task.description || "No description provided."}
                    </p>

                    <div className="task-meta">
                      <span>
                        Priority: <strong>{task.priority}</strong>
                      </span>

                      <span>
                        Due: <strong>{task.due_date}</strong>
                      </span>
                    </div>

                    <div className="task-card-footer">
                      <span>View Task</span>

                      <span>→</span>
                    </div>
                  </article>
                ))}
              </div>

              {/* ---------------------------------------
                  PAGINATION
              --------------------------------------- */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="button button-secondary"
                    disabled={!hasPrevious}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    ← Previous
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="button button-secondary"
                    disabled={!hasNext}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProjectDetails;
