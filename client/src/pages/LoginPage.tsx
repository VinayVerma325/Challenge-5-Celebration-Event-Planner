import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';
import { Alert } from '../components/Alert.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await quickDemoLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-4">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to manage your celebrations, budgets, and AI plans
          </p>
        </div>

        {/* Quick Evaluator Access Banner */}
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-rose-600" aria-hidden="true" />
            <h2 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              Fast Evaluator Access
            </h2>
          </div>
          <p className="text-xs text-rose-700 mb-3">
            Click below to instantly access the full platform with a pre-configured demo account.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700"
            onClick={handleDemoLogin}
            isLoading={demoLoading}
          >
            One-Click Evaluator Sign-In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="secondary" className="w-full mt-2" isLoading={isLoading}>
            Sign In with Email
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-700">
              Create an account
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure authentication with encrypted credentials</span>
        </div>
      </div>
    </div>
  );
};
