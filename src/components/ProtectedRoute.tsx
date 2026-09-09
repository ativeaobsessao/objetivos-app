import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MobileLayout } from './MobileLayout';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <MobileLayout className="p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
           <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mb-4" />
        </div>
      </MobileLayout>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
