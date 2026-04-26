import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/Login.jsx";

import ProjectsPage from "./pages/ProjectsPage.jsx";
import NewProjectPage from "./pages/NewProjectPage.jsx";
import EditProjectPage from "./pages/EditProjectPage.jsx";

import BugsPage from "./pages/BugsPage.jsx";
import BugPage from "./pages/BugPage.jsx";
import NewBugPage from "./pages/NewBugPage.jsx";
import EditBugPage from "./pages/EditBugPage.jsx";
import BugHistory from "./pages/BugHistory.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import CodeRunner from "./pages/CodeRunner.jsx";
import MyBugsPage from "./pages/MyBugsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import KanbanBoardPage from "./pages/KanbanBoardPage.jsx";
import HelpChatbot from "./components/HelpChatbot.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminRoute from "./contexts/AdminRoute.jsx";
import ProtectedRoute from "./contexts/ProtectedRoute.jsx";
import ProjectManagerRoute from "./contexts/ProjectManagerRoute.jsx";

export default function App() {
  return (
    <>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/my-bugs" element={<MyBugsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/projects/new"
            element={
              <ProjectManagerRoute>
                <NewProjectPage />
              </ProjectManagerRoute>
            }
          />
          <Route
            path="/projects/:project_id/edit"
            element={
              <ProjectManagerRoute>
                <EditProjectPage />
              </ProjectManagerRoute>
            }
          />

          <Route path="/projects/:project_id/bugs" element={<BugsPage />} />
          <Route path="/projects/:project_id/board" element={<KanbanBoardPage />} />
          <Route path="/projects/:project_id/bugs/new" element={<NewBugPage />} />
          <Route path="/projects/:project_id/bugs/:bug_id" element={<BugPage />} />
          <Route path="/projects/:project_id/bugs/:bug_id/edit" element={<EditBugPage />} />
          <Route path="/projects/:project_id/bugs/:bug_id/history" element={<BugHistory />} />

          <Route path="/code-runner" element={<CodeRunner />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

      </Routes>
      <HelpChatbot />
    </>
  );
}
