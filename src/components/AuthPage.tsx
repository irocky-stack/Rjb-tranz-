/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import GetStartedPage from './GetStartedPage';

interface AuthPageProps {
  onLogin: (username: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'auth'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');

  // Show the Get Started page first with smooth transition
  if (currentPage === 'welcome') {
    return (
      <div className="transition-opacity duration-500 ease-in-out">
        <GetStartedPage onGetStarted={() => setCurrentPage('auth')} />
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });
        if (error) throw error;
        user = data.user;
        if (!user) throw new Error("Sign up successful, but no user object returned.");

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        user = data.user;
        if (!user) throw new Error("Sign in successful, but no user object returned.");
      }

      // Use username on signup, or extract from email on signin
      const loginIdentifier = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      onLogin(loginIdentifier);

    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20">
        <div className="text-center pt-8 pb-4 drop-shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://i.ibb.co/nsymNz8D/OIP.webp"
              alt="RJB TRANZ Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RJB TRANZ</h1>
          <p className="text-gray-600">Currency Exchange Management</p>
        </div>

        <div className="p-8 relative z-10">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${mode === 'signin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/50 text-blue-900 hover:bg-white/70'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${mode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/50 text-blue-900 hover:bg-white/70'
                }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 drop-shadow-sm">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'signin' ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Professional Currency Exchange Management System
        </p>
      </div>
    </div>
  );
}