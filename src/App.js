import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import EmployerJobs from "./pages/EmployerJobs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminUsers from "./pages/AdminUsers";

function Layout({ children, hideNav }) {
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><Home /></Layout>} />

          {/* Candidate */}
          <Route path="/jobs" element={<Layout><ProtectedRoute roles={["candidate"]}><Jobs /></ProtectedRoute></Layout>} />
          <Route path="/my-applications" element={<Layout><ProtectedRoute roles={["candidate"]}><MyApplications /></ProtectedRoute></Layout>} />
          <Route path="/profile" element={<Layout><ProtectedRoute roles={["candidate"]}><Profile /></ProtectedRoute></Layout>} />

          {/* Employer */}
          <Route path="/employer/post-job" element={<Layout><ProtectedRoute roles={["employer"]}><PostJob /></ProtectedRoute></Layout>} />
          <Route path="/employer/jobs" element={<Layout><ProtectedRoute roles={["employer"]}><EmployerJobs /></ProtectedRoute></Layout>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<Layout><ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute></Layout>} />
          <Route path="/admin/jobs" element={<Layout><ProtectedRoute roles={["admin"]}><AdminJobs /></ProtectedRoute></Layout>} />
          <Route path="/admin/users" element={<Layout><ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute></Layout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
