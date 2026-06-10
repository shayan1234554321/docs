'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, registerSchema } from '../../validators/sharedSchemas';
import { ZodError } from 'zod';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToOther: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToOther }: AuthModalProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError(null);
    setLoading(true);

    try {
      // Client-side Zod validation
      loginSchema.parse({ email, password });

      await login(email, password);
      onClose();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errors: any = {};
        err.issues.forEach((zodErr) => {
          if (zodErr.path[0]) {
            errors[zodErr.path[0]] = zodErr.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setApiError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-error-custom">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-error-custom">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent-primary py-2 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center mt-4 border-t border-border-custom pt-4">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToOther}
              disabled={loading}
              className="font-medium text-accent-primary hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export const SignupModal = ({ isOpen, onClose, onSwitchToOther }: AuthModalProps) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError(null);
    setLoading(true);

    try {
      // Client-side Zod validation
      registerSchema.parse({ email, password });

      await signup(email, password);
      onClose();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errors: any = {};
        err.issues.forEach((zodErr) => {
          if (zodErr.path[0]) {
            errors[zodErr.path[0]] = zodErr.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setApiError(err.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create your free account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="signup-email">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-error-custom">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
            placeholder="Min. 8 characters"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-error-custom">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent-primary py-2 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className="text-center mt-4 border-t border-border-custom pt-4">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToOther}
              disabled={loading}
              className="font-medium text-accent-primary hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};
