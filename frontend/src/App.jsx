import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import BursarDashboard from './pages/dashboards/BursarDashboard';
import DeanDashboard from './pages/dashboards/DeanDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import Users from './pages/Users';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Discipline from './pages/Discipline';
import Homework from './pages/Homework';
import Exercises from './pages/Exercises';
import Notes from './pages/Notes';
import Fees from './pages/Fees';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRouter />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="students" element={<ProtectedRoute roles={['admin', 'dean', 'bursar', 'teacher']}><Students /></ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute roles={['admin', 'dean']}><Teachers /></ProtectedRoute>} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<ProtectedRoute roles={['admin', 'dean', 'teacher']}><Attendance /></ProtectedRoute>} />
        <Route path="marks" element={<ProtectedRoute roles={['admin', 'teacher']}><Marks /></ProtectedRoute>} />
        <Route path="discipline" element={<ProtectedRoute roles={['admin', 'teacher', 'dean']}><Discipline /></ProtectedRoute>} />
        <Route path="homework" element={<Homework />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="notes" element={<Notes />} />
        <Route path="fees" element={<ProtectedRoute roles={['admin', 'bursar']}><Fees /></ProtectedRoute>} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="reports" element={<ProtectedRoute roles={['student']}><Reports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardRouter() {
  const { user } = useSelector((s) => s.auth);
  if (!user) return null;
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'bursar': return <BursarDashboard />;
    case 'dean': return <DeanDashboard />;
    case 'teacher': return <TeacherDashboard />;
    case 'student': return <StudentDashboard />;
    default: return <AdminDashboard />;
  }
}

export default App;
