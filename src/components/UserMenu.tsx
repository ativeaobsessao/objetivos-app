import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  if (!user) return null;

  const handleResetPassword = async () => {
    setIsResetting(true);
    setResetMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetMessage('Email de recuperação enviado!');
    } catch (err: any) {
      setResetMessage(err.message || 'Erro ao enviar email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
      >
        <UserIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
              >
                <Key className="w-4 h-4 mr-2" />
                Trocar senha
              </button>
              
              {resetMessage && (
                <p className="px-3 text-xs text-gray-500">{resetMessage}</p>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
