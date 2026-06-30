import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import { getSessionUser, hasSession } from '../services/api.js';
import { canAccess } from '../config/roles.js';

const Login = lazy(() => import('../pages/auth/Login.jsx'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard.jsx'));
const Projects = lazy(() => import('../pages/projects/Projects.jsx'));
const SiteUpdates = lazy(() => import('../pages/projects/SiteUpdates.jsx'));
const Workers = lazy(() => import('../pages/workers/Workers.jsx'));
const Attendance = lazy(() => import('../pages/attendance/Attendance.jsx'));
const Materials = lazy(() => import('../pages/materials/Materials.jsx'));
const AiInsights = lazy(() => import('../pages/ai/AiInsights.jsx'));
const Workforce = lazy(() => import('../pages/workers/Workforce.jsx'));
const Reports = lazy(() => import('../pages/reports/Reports.jsx'));
const Settings = lazy(() => import('../pages/settings/Settings.jsx'));

function ProtectedRoute() {
  return hasSession() ? <AppLayout /> : <Navigate to="/login" replace />;
}

function RoleRoute({ path, children }) {
  const user = getSessionUser();
  return canAccess(user?.role, path) ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-600">Loading SCPRAS workspace...</div>}><Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RoleRoute path="/dashboard"><Dashboard /></RoleRoute>} />
        <Route path="/projects" element={<RoleRoute path="/projects"><Projects /></RoleRoute>} />
        <Route path="/site-updates" element={<RoleRoute path="/site-updates"><SiteUpdates /></RoleRoute>} />
        <Route path="/workers" element={<RoleRoute path="/workers"><Workers /></RoleRoute>} />
        <Route path="/attendance" element={<RoleRoute path="/attendance"><Attendance /></RoleRoute>} />
        <Route path="/materials" element={<RoleRoute path="/materials"><Materials /></RoleRoute>} />
        <Route path="/ai-insights" element={<RoleRoute path="/ai-insights"><AiInsights /></RoleRoute>} />
        <Route path="/workforce" element={<RoleRoute path="/workforce"><Workforce /></RoleRoute>} />
        <Route path="/reports" element={<RoleRoute path="/reports"><Reports /></RoleRoute>} />
        <Route path="/settings" element={<RoleRoute path="/settings"><Settings /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes></Suspense>
  );
}
