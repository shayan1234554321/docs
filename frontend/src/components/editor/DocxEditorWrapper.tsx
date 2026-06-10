'use client';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createEmptyDocument, type DocxEditorRef } from '@eigenpal/docx-editor-react';

// Import CSS for the editor
import '@eigenpal/docx-editor-react/styles.css';

// Dynamically import the DocxEditor component with SSR disabled
const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((mod) => mod.DocxEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center bg-bg-primary border border-border-custom rounded-lg shadow-sm">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-accent-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-text-secondary text-sm">Loading rich text editor...</p>
        </div>
      </div>
    ),
  }
);

interface DocxEditorWrapperProps {
  fileBase64: string;
  isReadOnly: boolean;
  onSave: (updatedBase64: string) => void;
  /**
   * Fired whenever the user edits the document body. The parent uses this
   * to flip the global save-status indicator to "unsaved".
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * Optional zoom level for the editor canvas (forwarded to DocxEditor).
   * Used to auto-fit the paged view on small viewports — the page renders
   * at US-Letter width (~816px) and overflows horizontally on phones
   * unless scaled down.
   */
  initialZoom?: number;
  /**
   * Whether to show the editor's built-in zoom control. Off by default on
   * phones to keep the header chrome compact; the page auto-fits via
   * `initialZoom` instead.
   */
  showZoomControl?: boolean;
}

/**
 * Imperative handle exposed to the parent so it can trigger a save
 * from a page-header button (in addition to the editor's own File > Save).
 */
export interface DocxEditorHandle {
  /**
   * Serialize the current editor contents to a base64 string.
   * Returns null if the editor is read-only or has no document to save.
   */
  save: () => Promise<string | null>;
  /**
   * Return the current editor contents as a raw .docx buffer, so the parent
   * can hand it to a download/Export action. Mirrors `save()` but skips the
   * base64 step. Returns null if the editor has nothing to export.
   */
  exportBuffer: () => Promise<Uint8Array | null>;
}

// Convert an ArrayBuffer (or any ArrayBufferView) to a base64 string.
// Uses 8 KB chunks to avoid "Maximum call stack size exceeded" on large docs.
const toBase64 = (buf: ArrayBuffer | ArrayBufferView): string => {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  const len = bytes.byteLength;
  const chunk = 8192;
  let binary = '';
  for (let i = 0; i < len; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return window.btoa(binary);
};

const DocxEditorWrapper = React.forwardRef<DocxEditorHandle, DocxEditorWrapperProps>(function DocxEditorWrapper(
  { fileBase64, isReadOnly, onSave, onDirtyChange, initialZoom, showZoomControl },
  ref
) {
  const [buffer, setBuffer] = useState<Uint8Array | null>(null);
  const [emptyDoc, setEmptyDoc] = useState<ReturnType<typeof createEmptyDocument> | null>(null);
  const docxRef = useRef<DocxEditorRef>(null);

  // Convert Base64 string to Uint8Array when fileBase64 changes
  useEffect(() => {
    if (!fileBase64) {
      setBuffer(null);
      setEmptyDoc(createEmptyDocument());
      return;
    }

    try {
      const binaryString = window.atob(fileBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      setBuffer(bytes);
      setEmptyDoc(null);
    } catch (err) {
      console.error('Failed to convert base64 to buffer:', err);
      setBuffer(null);
      setEmptyDoc(createEmptyDocument());
    }
  }, [fileBase64]);

  // Editor's own File > Save action — keeps the existing wiring intact.
  const handleSave = (updatedBuffer: any) => {
    if (isReadOnly) return;

    try {
      const base64 = toBase64(updatedBuffer as ArrayBuffer);
      onSave(base64);
    } catch (err) {
      console.error('Failed to convert saved buffer to base64:', err);
    }
  };

  // Imperative save: triggered by the page-header Save button.
  useImperativeHandle(
    ref,
    () => ({
      save: async () => {
        if (isReadOnly) return null;
        const result = await docxRef.current?.save({ selective: false });
        if (!result) return null;
        try {
          return toBase64(result);
        } catch (err) {
          console.error('Failed to convert imperative save buffer to base64:', err);
          return null;
        }
      },
      exportBuffer: async () => {
        // Read the live in-editor state, regardless of read-only mode —
        // export is a "get what I see" action and view-only users should
        // still be able to download the document.
        const result = await docxRef.current?.save({ selective: false });
        if (!result) return null;
        return result instanceof Uint8Array
          ? result
          : new Uint8Array(result as ArrayBuffer);
      },
    }),
    [isReadOnly]
  );

  // Editor content change — forward as a "dirty" signal so the parent
  // can flip its unsaved-changes indicator.
  const handleEditorChange = (_doc: unknown) => {
    if (!isReadOnly) {
      onDirtyChange?.(true);
    }
  };

  if (buffer === null && emptyDoc === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-secondary text-sm">Initializing document content...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg-primary rounded-lg border border-border-custom shadow-sm overflow-hidden min-h-100 sm:min-h-150 flex flex-col">
      <DocxEditor
        ref={docxRef}
        documentBuffer={buffer}
        document={emptyDoc}
        mode={isReadOnly ? 'viewing' : 'editing'}
        onSave={handleSave}
        onChange={handleEditorChange}
        showToolbar={!isReadOnly}
        initialZoom={initialZoom}
        showZoomControl={showZoomControl}
      />
    </div>
  );
});

export default DocxEditorWrapper;
