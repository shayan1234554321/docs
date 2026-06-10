'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, LogOut, Share2, Trash2, Calendar, Eye, Edit, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { CreateDocModal } from '../../components/dashboard/CreateDocModal';

interface IDocument {
  _id: string;
  name: string;
  visibility: 'public' | 'private';
  user: string;
  createdAt: string;
  updatedAt: string;
  access: Array<{ email: string; access: 'view' | 'edit' }>;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<IDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<IDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const response = await api.get('/docs');
      if (response.data.success) {
        setDocs(response.data.data);
        setFilteredDocs(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not logged in after loading finishes
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDocs();
    }
  }, [user]);

  // Filter docs based on search
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredDocs(docs);
    } else {
      setFilteredDocs(
        docs.filter((doc) => doc.name.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, docs]);

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to doc
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setActionLoadingId(docId);
    try {
      const response = await api.delete(`/docs/${docId}`);
      if (response.data.success) {
        setDocs(docs.filter((doc) => doc._id !== docId));
      }
    } catch (err) {
      alert('Failed to delete document. Only the owner can delete it.');
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || (!user && !loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-accent-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-text-secondary text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary border-b border-border-custom px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-accent-primary p-1.5 rounded-md text-white">
              <FileText size={20} />
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight">Docs</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium bg-bg-secondary border border-border-custom text-text-secondary rounded-full px-3 py-1">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-text-secondary hover:text-text-primary p-1.5 rounded-md hover:bg-bg-secondary transition-all flex items-center gap-1.5 text-sm font-medium cursor-pointer"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Upper bar: Search & Create */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">My Documents</h1>
            <p className="text-sm text-text-secondary">Create and manage your shared workspace</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-tertiary">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border-custom bg-bg-primary pl-9 pr-4 py-2 text-sm text-text-primary focus-ring"
              />
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-accent-primary hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={16} /> New Doc
            </button>
          </div>
        </div>

        {/* Documents display grid */}
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-accent-primary mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-text-secondary text-sm">Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-bg-primary rounded-lg border border-border-custom p-16 text-center shadow-sm">
            <div className="bg-bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-text-tertiary">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-text-primary text-base mb-1">No documents found</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
              {searchQuery ? "We couldn't find any documents matching your search query." : "Get started by creating your first document and editing it locally."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-accent-primary hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                Create New Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const isOwner = doc.user === user?.id;
              return (
                <Link
                  key={doc._id}
                  href={`/share/${doc._id}`}
                  className="bg-bg-primary hover:bg-bg-primary/80 border border-border-custom hover:border-accent-primary/50 rounded-lg p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-44 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors text-base truncate pr-2" title={doc.name}>
                        {doc.name}
                      </h3>
                      {/* Visibility Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                        doc.visibility === 'public'
                          ? 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20'
                          : 'bg-bg-tertiary text-text-secondary border border-border-custom'
                      }`}>
                        <Share2 size={10} />
                        {doc.visibility === 'public' ? 'Public' : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                      <Calendar size={12} />
                      <span>Updated {formatDate(doc.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions / Meta bottom row */}
                  <div className="flex items-center justify-between border-t border-border-custom pt-3 mt-4">
                    <span className={`text-2xs font-medium rounded-md px-2 py-0.5 ${
                      isOwner
                        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                        : 'bg-bg-secondary text-text-secondary border border-border-custom'
                    }`}>
                      {isOwner ? 'Owner' : 'Shared'}
                    </span>

                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <button
                          disabled={actionLoadingId === doc._id}
                          onClick={(e) => handleDeleteDoc(doc._id, e)}
                          className="text-text-secondary hover:text-error-custom p-1.5 rounded-md hover:bg-bg-secondary transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <span className="text-accent-primary p-1.5 rounded-md bg-bg-secondary group-hover:bg-accent-primary group-hover:text-white transition-all">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <CreateDocModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchDocs}
      />
    </div>
  );
}
