import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("Loading projects...");

  const navigate = useNavigate();
  const location = useLocation();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setMessage("Loading projects...");

      const response = await api.get(`/projects/?page=${currentPage}`);

      console.log("PROJECT PAGE RESPONSE:", response.data);

      // Projects of current page
      setProjects(response.data.results || []);

      // Pagination information
      setTotalPages(Math.ceil(response.data.count / 5));
      setHasNext(!!response.data.next);
      setHasPrevious(!!response.data.previous);

      setMessage("");
    } catch (error) {
      console.log("PROJECT ERROR:", error);
      console.log("RESPONSE:", error.response);

      setMessage("Could not load projects.");
    }
  }, [currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, location.key]);

  return (
    <main className="page">
      <div className="container">
        {/* PAGE HEADER */}
        <section className="page-header">
          <div>
            <p className="eyebrow">WORKSPACE</p>

            <h1 className="page-title">Dashboard</h1>

            <p className="page-subtitle">Welcome to your Issue Tracker 👋</p>
          </div>

          <button
            className="button button-primary"
            onClick={() => navigate("/create-project")}
          >
            + Create Project
          </button>
        </section>

        {/* PROJECT SECTION */}
        <section>
          <div className="section-header">
            <div className="section-heading">
              <h2>Your Projects</h2>

              <span className="badge badge-primary">
                {projects.length}{" "}
                {projects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {message && (
            <div className="state-card">
              <div className="state-icon">⏳</div>
              <p>{message}</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!message && projects.length === 0 && (
            <div className="state-card">
              <div className="state-icon">📁</div>

              <h3>No projects found</h3>

              <p>
                You don't have any projects yet. Create your first project to
                get started.
              </p>

              <button
                className="button button-primary"
                onClick={() => navigate("/create-project")}
              >
                + Create Your First Project
              </button>
            </div>
          )}

          {/* PROJECT GRID */}
          {!message && projects.length > 0 && (
            <>
              <div className="card-grid">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="project-card"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="project-icon">📁</div>

                    <div className="project-card-content">
                      <h3>{project.title}</h3>

                      <p className="project-description">
                        {project.description || "No description provided."}
                      </p>

                      <p className="project-date">
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="project-card-footer">
                      <span>View Project</span>
                      <span>→</span>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINATION */}
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

export default Dashboard;
