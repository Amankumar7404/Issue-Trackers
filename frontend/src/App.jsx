import EditTask from "./pages/EditTask";
import EditProject from "./pages/EditProject";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProject from "./pages/CreateProject";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects/:id" element={<ProjectDetails />} />

          <Route
            path="/projects/:projectId/create-task"
            element={<CreateTask />}
          />

          <Route path="/tasks/:id" element={<TaskDetails />} />

          <Route path="/tasks/:id/edit" element={<EditTask />} />

          <Route path="/create-project" element={<CreateProject />} />

          <Route path="/projects/:id/edit" element={<EditProject />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
