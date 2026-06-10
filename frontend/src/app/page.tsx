'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Users, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal, SignupModal } from '../components/auth/AuthModals';

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleOpenLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleOpenSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary border-b border-border-custom px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-accent-primary p-1.5 rounded-md text-white">
              <FileText size={20} />
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight">Docs</span>
          </Link>

          <nav className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
                    >
                      Go to Editor
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleOpenLogin}
                      className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleOpenSignup}
                      className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-semibold mb-6 border border-accent-primary/20">
          <span>Introducing Docs 1.0</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-tight mb-6">
          Write, collaborate, and share.<br />
          <span className="text-accent-primary">All in one workspace.</span>
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Create rich documents, configure granular view/edit permission lists, and publish public or private pages. Optimized for clear writing and team alignment.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-accent-primary px-6 py-3 font-semibold text-white hover:bg-accent-hover shadow-md transition-all cursor-pointer"
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <button
                onClick={handleOpenSignup}
                className="inline-flex items-center gap-2 rounded-md bg-accent-primary px-6 py-3 font-semibold text-white hover:bg-accent-hover shadow-md transition-all cursor-pointer"
              >
                Start Writing for Free <ArrowRight size={18} />
              </button>
              <button
                onClick={handleOpenLogin}
                className="rounded-md border border-border-custom bg-bg-primary px-6 py-3 font-semibold text-text-primary hover:bg-bg-secondary transition-all cursor-pointer"
              >
                Sign In to Account
              </button>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left mt-8">
          <div className="bg-bg-primary p-6 rounded-lg border border-border-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-accent-primary/10 text-accent-primary w-10 h-10 rounded-md flex items-center justify-center mb-4">
              <FileText size={22} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-base">Rich Document Editor</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Equipped with `@eigenpal/docx-editor-react` to support full formatting, alignment, and offline-first docx files.
            </p>
          </div>

          <div className="bg-bg-primary p-6 rounded-lg border border-border-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-accent-primary/10 text-accent-primary w-10 h-10 rounded-md flex items-center justify-center mb-4">
              <Users size={22} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-base">Access Control Lists</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Add email addresses with specific read or write permissions. Grant access immediately without confirmation.
            </p>
          </div>

          <div className="bg-bg-primary p-6 rounded-lg border border-border-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-accent-primary/10 text-accent-primary w-10 h-10 rounded-md flex items-center justify-center mb-4">
              <Shield size={22} />
            </div>
            <h3 className="font-semibold text-text-primary mb-2 text-base">Public & Private Links</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Keep your docs private to you and selected colleagues, or open public visibility so anyone can read without logging in.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-custom py-6 px-6 text-center text-sm text-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Docs. Built for knowledge workers and high-performing teams.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToOther={handleOpenSignup}
      />
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToOther={handleOpenLogin}
      />
    </div>
  );
}
