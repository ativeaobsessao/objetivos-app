/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateObjective from './pages/CreateObjective';
import ObjectiveDetail from './pages/ObjectiveDetail';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function AuthRoute() {
  const { session } = useAuth();
  if (session) return <Navigate to="/" replace />;
  return <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateObjective />
            </ProtectedRoute>
          } />
          <Route path="/objective/:id" element={
            <ProtectedRoute>
              <ObjectiveDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
