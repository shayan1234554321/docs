'use client';

import React, { useState } from 'react';
import { Trash2, UserPlus, Shield, Eye, Edit, Globe, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../utils/api';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  currentVisibility: 'public' | 'private';
  currentAccessList: Array<{ email: string; access: 'view' | 'edit' }>;
  onRefresh: () => void;
}

export const ShareAccessModal = ({
  isOpen,
  onClose,
  docId,
  currentVisibility,
  currentAccessList,
  onRefresh,
}: ShareAccessModalProps) => {
  const [visibility, setVisibility] = useState<'public' | 'private'>(currentVisibility);
  const [newEmail, setNewEmail] = useState('');
  const [newAccess, setNewAccess] = useState<'view' | 'edit'>('view');
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingEmail, setActionLoadingEmail] = useState<string | null>(null);

  const handleUpdateVisibility = async (newVis: 'public' | 'private') => {
    setLoading(true);
    try {
      // In our design, visibility is part of the doc metadata.
      // We can update it by putting to /docs/:id with visibility in body.
      // Let's check if updateDocument handles updating visibility or metadata.
      // Wait, in our docController.ts:
      // updateDocument updates `doc` and `name` if they are present.
      // But what about visibility? Let's check:
      // Oh, in docController.ts:
      // `if (doc !== undefined) document.doc = doc;`
      // `if (name !== undefined) document.name = name;`
      // Wait! Does `updateDocument` support updating visibility?
      // Let's check:
      // It does NOT support updating visibility in the `updateDocument` method!
      // But wait! We can add visibility to `updateDocument` easily, or we can use another route.
      // Wait, let's verify if we can update visibility in updateDocument.
      // Yes! In `docController.ts` we have:
      // `if (doc !== undefined) document.doc = doc;`
      // `if (name !== undefined) document.name = name;`
      // If we also add:
      // `if (visibility !== undefined) document.visibility = visibility;`
      // to `updateDocument` (and update the Zod validator `updateDocSchema` to allow optional visibility!),
      // then we can update the visibility of a document using `PUT /docs/:id`!
      // This is a very clean and logical update. Let's check if we can do this change.
      // Yes! Let's check if we can modify `docController.ts` and `sharedSchemas.ts` to support optional visibility update.
      // Let's do that! That's a tiny, elegant tweak that makes visibility updates straightforward.
    } catch (err) {
      console.error(err);
    }
  };

  // Wait! Let's implement the visibility update call first.
  const updateVisibilitySetting = async (v: 'public' | 'private') => {
    setLoading(true);
    try {
      await api.put(`/docs/${docId}`, { visibility: v, doc: undefined });
      setVisibility(v);
      onRefresh();
    } catch (err) {
      alert('Failed to update visibility setting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    const email = newEmail.trim().toLowerCase();

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/docs/${docId}/access`, {
        email,
        access: newAccess,
      });

      if (response.data.success) {
        setNewEmail('');
        onRefresh();
      }
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Failed to add access');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (targetEmail: string) => {
    setActionLoadingEmail(targetEmail);
    try {
      const response = await api.put(`/docs/${docId}/access`, {
        email: targetEmail,
        access: 'remove',
      });

      if (response.data.success) {
        onRefresh();
      }
    } catch (err) {
      alert('Failed to remove access');
      console.error(err);
    } finally {
      setActionLoadingEmail(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share document">
      <div className="space-y-6">
        {/* Visibility toggle section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">General access</h3>
          <div className="flex items-center justify-between bg-bg-secondary p-3 rounded-lg border border-border-custom">
            <div className="flex items-center gap-3">
              <div className="bg-bg-primary p-2 rounded-md border border-border-custom text-text-secondary shadow-2xs">
                {visibility === 'public' ? <Globe size={18} className="text-accent-secondary" /> : <Lock size={18} />}
              </div>
              <div>
                <span className="block text-sm font-semibold text-text-primary capitalize">
                  {visibility} link
                </span>
                <span className="block text-xs text-text-secondary max-w-[220px]">
                  {visibility === 'public'
                    ? 'Anyone on the internet with this link can view'
                    : 'Only people with explicit access can open this link'}
                </span>
              </div>
            </div>

            <select
              value={visibility}
              onChange={(e) => updateVisibilitySetting(e.target.value as 'public' | 'private')}
              disabled={loading}
              className="rounded-md border border-border-custom bg-bg-primary px-2 py-1.5 text-xs font-medium text-text-primary focus-ring cursor-pointer"
            >
              <option value="private">Restricted</option>
              <option value="public">Anyone with link</option>
            </select>
          </div>
        </div>

        {/* Add access form */}
        <div className="border-t border-border-custom pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Add people</h3>
          <form onSubmit={handleAddAccess} className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError(null);
                }}
                disabled={loading}
                className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-xs"
              />
            </div>
            
            <select
              value={newAccess}
              onChange={(e) => setNewAccess(e.target.value as 'view' | 'edit')}
              disabled={loading}
              className="rounded-md border border-border-custom bg-bg-primary px-2 py-2 text-xs font-medium text-text-primary focus-ring cursor-pointer"
            >
              <option value="view">Viewer</option>
              <option value="edit">Editor</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-accent-primary hover:bg-accent-hover text-white rounded-md px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <UserPlus size={14} /> Add
            </button>
          </form>
          {emailError && (
            <p className="mt-1 text-xs text-error-custom">{emailError}</p>
          )}
        </div>

        {/* People with access list */}
        <div className="border-t border-border-custom pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">People with access</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentAccessList.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No other users have explicit access yet.</p>
            ) : (
              currentAccessList.map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-bg-secondary px-3 py-2 rounded-lg border border-border-custom text-xs">
                  <span className="text-text-primary font-medium truncate max-w-[200px]">{entry.email}</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-text-secondary font-medium">
                      {entry.access === 'edit' ? <Edit size={12} /> : <Eye size={12} />}
                      {entry.access === 'edit' ? 'Editor' : 'Viewer'}
                    </span>
                    <button
                      type="button"
                      disabled={actionLoadingEmail === entry.email || loading}
                      onClick={() => handleRemoveAccess(entry.email)}
                      className="text-text-secondary hover:text-error-custom p-1 rounded-md hover:bg-bg-tertiary transition-colors cursor-pointer disabled:opacity-50"
                      title="Remove access"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-border-custom pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border-custom bg-bg-primary px-4 py-2 text-xs font-semibold text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
