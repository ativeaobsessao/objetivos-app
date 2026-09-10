import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { MobileLayout } from '../components/MobileLayout';
import { KeyRound, Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Enviamos um link de recuperação para seu email.');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Conta criada! Verifique seu email se necessário, ou faça login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout className="p-6 justify-center">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {isForgotPassword ? 'Recuperar Senha' : (isLogin ? 'Bem-vindo de volta' : 'Criar Conta')}
          </h1>
          <p className="text-gray-500 mt-2">
            {isForgotPassword 
              ? 'Informe seu email para redefinir' 
              : (isLogin ? 'Faça login para continuar' : 'Comece a acompanhar seus objetivos')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  minLength={6}
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}
          {message && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-xl">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-gray-900 text-white rounded-2xl font-medium active:scale-95 transition-transform disabled:opacity-70"
          >
            {loading ? 'Aguarde...' : (isForgotPassword ? 'Enviar Link' : (isLogin ? 'Entrar' : 'Cadastrar'))}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-100"
            >
              Esqueceu sua senha?
            </button>
          )}

          <div className="flex justify-center items-center gap-1 text-sm">
            <span className="text-gray-500">
              {isForgotPassword 
                ? 'Lembrou sua senha?' 
                : (isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?')}
            </span>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setIsLogin(!isLogin);
              }}
              className="font-medium text-gray-900 dark:text-gray-100 hover:underline"
            >
              {isForgotPassword 
                ? 'Voltar ao login' 
                : (isLogin ? 'Criar agora' : 'Faça login')}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
