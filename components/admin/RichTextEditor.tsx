/**
 * Rich Text Editor Component (TipTap)
 *
 * Based on: TipTap React (2025 latest)
 * Purpose: WYSIWYG editor for notice content
 * Standards: GLEC-Design-System-Standards.md
 *
 * Features:
 * - Bold, Italic, Underline, Strike
 * - Headings (H1-H3)
 * - Paragraph, Lists (Ordered, Unordered)
 * - Links
 * - Images (with upload support)
 * - Code blocks
 * - Placeholder text
 *
 * Usage:
 * ```tsx
 * <RichTextEditor
 *   content={content}
 *   onChange={(html) => setContent(html)}
 *   placeholder="공지사항 내용을 입력하세요..."
 * />
 * ```
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useImageUpload } from '@/hooks/useImageUpload';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  editable = true,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, progress, error, clearError } = useImageUpload();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 hover:text-primary-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Important for Next.js App Router SSR
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes (for external updates)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  /**
   * Handle image file upload
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Clear error
    clearError();

    // Upload file to R2
    const result = await uploadImage(file);

    if (result) {
      // Insert image into editor
      editor.chain().focus().setImage({ src: result.publicUrl }).run();

      // Show success message
      console.log(`[Image Uploaded] ${result.publicUrl}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400">에디터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Upload Error */}
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">이미지 업로드 실패</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-blue-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="4"
                stroke="currentColor"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-blue-700 text-sm font-medium">
              이미지 업로드 중... {progress}%
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        {/* Toolbar */}
        {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300 font-bold' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9m0 0a3 3 0 100-6H6v6zm9 0a3 3 0 110 6H6v-6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300 italic' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-300 line-through' : ''
            }`}
            title="Strikethrough"
          >
            <span className="font-semibold">S</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors font-semibold ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors font-semibold ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors font-semibold ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 3"
          >
            H3
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('paragraph') ? 'bg-gray-300' : ''
            }`}
            title="Paragraph"
          >
            P
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Ordered List"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6v2m0 0v2m0-2h2M3 12v2m0 0v2m0-2h2M3 18v2m0 0v2m0-2h2" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-gray-300' : ''
            }`}
            title="Code Block"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('URL 입력:', '');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-300' : ''
            }`}
            title="Add Link"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600"
              title="Remove Link"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Image Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isUploading ? 'bg-blue-100' : ''
            }`}
            title={isUploading ? `업로드 중... ${progress}%` : '이미지 업로드'}
          >
            {isUploading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="4"
                  stroke="currentColor"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>
      )}

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
        />
      </div>
    </div>
  );
}
