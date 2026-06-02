import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Focus     from './pages/Focus';
import Analytics from './pages/Analytics';
import Calendar  from './pages/Calendar';
import Settings  from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';

function Private({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />

        {/* All protected routes — sidebar pages */}
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/focus"     element={<Private><Focus /></Private>} />
        <Route path="/analytics" element={<Private><Analytics /></Private>} />
        <Route path="/calendar"  element={<Private><Calendar /></Private>} />
        <Route path="/settings"  element={<Private><Settings /></Private>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
