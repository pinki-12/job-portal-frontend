import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register     = (data) => api.post("/auth/register", data);
export const login        = (data) => api.post("/auth/login", data);
export const getMe        = ()     => api.get("/auth/me");
export const changePassword = (data) => api.post("/auth/change-password", data);

// Profile — general update (text fields only; no file here)
export const updateProfile = (data) => api.put("/auth/profile", data);

// File upload helpers — always multipart/form-data
export const uploadResume = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.put("/auth/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const uploadProfilePicture = (file) => {
  const fd = new FormData();
  fd.append("profilePicture", file);
  return api.put("/auth/profile/picture", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

export const uploadCompanyLogo = (file) => {
  const fd = new FormData();
  fd.append("companyLogo", file);
  return api.put("/auth/profile/company-logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

// Jobs
export const getJobs               = (params) => api.get("/jobs", { params });
export const getJob                = (id)     => api.get(`/jobs/${id}`);
export const createJob             = (data)   => api.post("/jobs", data);
export const deleteJob             = (id)     => api.delete(`/jobs/${id}`);
export const applyJob              = (data)   => api.post("/jobs/apply", data);
export const getMyApplications     = ()       => api.get("/jobs/candidate/my-applications");
export const withdrawApplication   = (id)     => api.delete(`/jobs/applications/${id}/withdraw`);
export const getEmployerJobs       = ()       => api.get("/jobs/employer/my-jobs");
export const getApplicants         = (jobId)  => api.get(`/jobs/${jobId}/applicants`);
export const updateApplicationStatus = (id, data) => api.patch(`/jobs/applications/${id}/status`, data);

// Admin
export const getAdminStats    = ()         => api.get("/admin/stats");
export const getAdminJobs     = (params)   => api.get("/admin/jobs", { params });
export const approveJob       = (id)       => api.patch(`/admin/jobs/${id}/approve`);
export const rejectJob        = (id, data) => api.patch(`/admin/jobs/${id}/reject`, data);
export const deleteAdminJob   = (id)       => api.delete(`/admin/jobs/${id}`);
export const getAdminUsers    = (params)   => api.get("/admin/users", { params });
export const toggleUserStatus = (id)       => api.patch(`/admin/users/${id}/toggle`);
export const verifyEmployer   = (id)       => api.patch(`/admin/employers/${id}/verify`);

export default api;
