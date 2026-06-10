'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Eye, Edit, Upload, X, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../utils/api';
import { createDocSchema } from '../../validators/sharedSchemas';
import { ZodError } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Convert ArrayBuffer to base64 using chunked approach to avoid stack overflow
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunk = 8192;
  let binary = '';
  for (let i = 0; i < len; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return window.btoa(binary);
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TempAccessEntry {
  email: string;
  access: 'view' | 'edit';
}

export const CreateDocModal = ({ isOpen, onClose, onSuccess }: CreateDocModalProps) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [accessList, setAccessList] = useState<TempAccessEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newAccess, setNewAccess] = useState<'view' | 'edit'>('view');

  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddAccess = () => {
    setEmailError(null);
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Email address is required');
      return;
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (accessList.some((entry) => entry.email === trimmedEmail)) {
      setEmailError('This email is already in the list');
      return;
    }

    setAccessList([...accessList, { email: trimmedEmail, access: newAccess }]);
    setNewEmail('');
  };

  const handleRemoveAccess = (index: number) => {
    setAccessList(accessList.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== DOCX_MIME) {
      setFileError('Only .docx files are supported');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File must be smaller than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      setFileBase64(base64);
      setFileName(file.name);
      setFileSize(file.size);

      // Auto-fill document name from filename (strip extension)
      if (!name) {
        const strippedName = file.name.replace(/\.docx$/i, '');
        setName(strippedName);
      }
    } catch {
      setFileError('Failed to read file');
    }
  };

  const handleRemoveFile = () => {
    setFileBase64(null);
    setFileName(null);
    setFileSize(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);

    try {
      // Validate schema
      const payload: Record<string, unknown> = {
        name,
        visibility,
        access: accessList,
      };

      if (fileBase64) {
        payload.doc = fileBase64;
      }

      createDocSchema.parse(payload);

      console.log('[CreateDocModal] Sending payload:', {
        name,
        visibility,
        accessCount: accessList.length,
        hasDoc: !!fileBase64,
        docLength: fileBase64?.length,
      });
      const response = await api.post('/docs', payload);
      console.log('[CreateDocModal] Response:', response.data);
      if (response.data.success) {
        onClose();
        onSuccess();
        router.push(`/share/${response.data.data._id}`);
      }
    } catch (err: any) {
      console.error('Failed to create document:', err);
      if (err instanceof ZodError) {
        setSubmitError(err.issues[0]?.message || 'Validation Error');
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to create document. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Document">
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="doc-name">
            Document Title
          </label>
          <input
            id="doc-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
            placeholder="e.g. Q3 Roadmap"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Import from file (Optional)
          </label>

          {fileBase64 ? (
            <div className="flex items-center justify-between bg-bg-secondary border border-border-custom rounded-md px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-accent-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{fileName}</p>
                  <p className="text-xs text-text-secondary">{formatFileSize(fileSize!)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={loading}
                className="text-text-secondary hover:text-error-custom transition-colors p-1 flex-shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed border-border-custom rounded-md px-4 py-6 cursor-pointer transition-colors ${
                fileError ? 'border-error-custom' : 'hover:border-accent-primary hover:bg-bg-secondary'
              }`}
            >
              <Upload size={24} className="text-text-secondary mb-2" />
              <p className="text-sm text-text-secondary">Click to upload</p>
              <p className="text-xs text-text-secondary mt-1">.docx files up to {formatFileSize(MAX_FILE_SIZE)}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          )}

          {fileError && (
            <p className="mt-1 text-xs text-error-custom">{fileError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Link Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer border border-border-custom bg-bg-primary rounded-md px-4 py-2 flex-1">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                disabled={loading}
                className="text-accent-primary focus:ring-accent-primary"
              />
              <div className="text-left">
                <span className="block text-sm font-medium text-text-primary">Private</span>
                <span className="block text-xs text-text-secondary">Only added emails have access</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer border border-border-custom bg-bg-primary rounded-md px-4 py-2 flex-1">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                disabled={loading}
                className="text-accent-primary focus:ring-accent-primary"
              />
              <div className="text-left">
                <span className="block text-sm font-medium text-text-primary">Public</span>
                <span className="block text-xs text-text-secondary">Anyone with the link can view</span>
              </div>
            </label>
          </div>
        </div>

        {/* Access List Builders */}
        <div className="border-t border-border-custom pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Share with colleagues (Optional)
          </label>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError(null);
                }}
                disabled={loading}
                className="w-full rounded-md border border-border-custom px-3 py-2 text-text-primary bg-bg-primary focus-ring text-sm"
                placeholder="colleague@example.com"
              />
            </div>

            <select
              value={newAccess}
              onChange={(e) => setNewAccess(e.target.value as 'view' | 'edit')}
              disabled={loading}
              className="rounded-md border border-border-custom bg-bg-primary px-2 py-2 text-sm text-text-primary focus-ring"
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
            </select>

            <button
              type="button"
              onClick={handleAddAccess}
              disabled={loading}
              className="bg-bg-secondary border border-border-custom text-text-primary rounded-md px-3 hover:bg-bg-tertiary transition-colors flex items-center justify-center cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>

          {emailError && (
            <p className="mt-1 text-xs text-error-custom">{emailError}</p>
          )}

          {/* Current Sharing List */}
          {accessList.length > 0 && (
            <div className="mt-3 bg-bg-secondary rounded-md border border-border-custom max-h-36 overflow-y-auto p-2 space-y-1">
              {accessList.map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-bg-primary px-3 py-1.5 rounded-md border border-border-custom text-xs">
                  <span className="text-text-primary font-medium truncate max-w-[220px]">{entry.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      {entry.access === 'edit' ? <Edit size={12} /> : <Eye size={12} />}
                      {entry.access === 'edit' ? 'Editor' : 'Viewer'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccess(index)}
                      className="text-text-secondary hover:text-error-custom transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border-custom pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-border-custom bg-bg-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
