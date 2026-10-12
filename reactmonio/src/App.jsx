import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Layout from './components/layout/AppLayout';
import Ledger from './pages/Ledger';
import Notes from './pages/Notes';
import Nikki from "./pages/Nikki";
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Login';

// in your routes:

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <Layout><Outlet /></Layout>
    : <Navigate to="/login" />;
};

const AdminRoute = () => {
  const { user } = useAuth();
  return user?.role === 'admin'
    ? <Outlet />
    : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />

      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* All protected pages go here — Layout renders once */}
      <Route element={<ProtectedRoute />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/ledger' element={<Ledger />} />
        <Route path="/checklists" element={<Notes />} />
        <Route path="/nikki" element={<Nikki />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/statistics' element={<Statistics />} />

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;