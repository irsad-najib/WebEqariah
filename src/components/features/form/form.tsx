"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import {
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  Bold,
  Italic,
  X,
  Play,
  Upload,
} from "lucide-react";
import axios from "axios";
import { axiosInstance } from "@/lib/utils/api";
import { useToast, ToastContainer } from "@/components/ui/toast";

// Custom video node for Tiptap so we can embed uploaded mp4 files easily
const Video = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const directSrc = element.getAttribute("src");
          const sourceChild = element.querySelector("source");
          return directSrc || sourceChild?.getAttribute("src") || null;
        },
      },
      controls: {
        default: true,
      },
      playsinline: {
        default: true,
      },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(
        {
          controls: true,
          playsinline: "",
          class: "editor-video",
        },
        HTMLAttributes
      ),
    ];
  },
  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

interface MyEditorProps {
  value?: string;
  onEditorChange: (content: string) => void;
  onSend?: () => void;
  onMediaUpload?: (mediaUrl: string) => void;
  uploadEndpoint?: string;
  showSendButton?: boolean;
}

export default function MyEditor({
  value,
  onEditorChange,
  onSend,
  onMediaUpload,
  uploadEndpoint = "/api/upload-media",
  showSendButton = true,
}: MyEditorProps) {
  const { toasts, closeToast, error: showError, warning } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "video";
    src: string;
    file: File;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onEditorChangeRef = useRef(onEditorChange);
  const onMediaUploadRef = useRef(onMediaUpload);

  useEffect(() => {
    onEditorChangeRef.current = onEditorChange;
  }, [onEditorChange]);

  useEffect(() => {
    onMediaUploadRef.current = onMediaUpload;
  }, [onMediaUpload]);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const processFile = useCallback((file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setMediaPreview({
        type: isImage ? "image" : "video",
        src,
        file,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
        }),
        Placeholder.configure({
          placeholder: "Type a message...",
        }),
        Image.configure({
          HTMLAttributes: {
            class: "editor-image",
          },
        }),
        Link.configure({
          autolink: true,
          openOnClick: false,
          linkOnPaste: true,
        }),
        Video,
      ],
      content: value || "",
      onUpdate: ({ editor }) => {
        onEditorChangeRef.current(editor.getHTML());
      },
    },
    []
  );

  useEffect(() => {
    if (!editor) return;
    setEditorReady(true);

    const handleFocus = () => setShowToolbar(true);
    const handleBlur = () => setShowToolbar(false);

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if (value === undefined) return;

    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  // Drag & drop overlay handling matches previous behaviour
  useEffect(() => {
    if (!isClient || isMobile || !containerRef.current) return;

    const container = containerRef.current;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!container.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const mediaFile = files.find(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (mediaFile) {
        processFile(mediaFile);
      }
    };

    container.addEventListener("dragenter", handleDragEnter);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragenter", handleDragEnter);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, [isClient, isMobile, processFile]);

  const uploadFileToAPI = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("source", "marketplace");

        const response = await axiosInstance.post(uploadEndpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data?.data?.url || response.data?.url || null;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            showError(
              "Muat naik gagal",
              "Masa tamat. Video terlalu besar atau sambungan perlahan"
            );
          } else if (error.response?.status === 413) {
            showError("Fail terlalu besar", "Maksimum 100MB sahaja");
          } else if (error.response?.status === 401) {
            warning(
              "Sila login dahulu",
              "Anda perlu login untuk muat naik fail"
            );
          } else {
            showError(
              "Muat naik gagal",
              error.response?.data?.message || error.message
            );
          }
        } else {
          showError("Muat naik gagal", "Sila cuba lagi");
        }

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadEndpoint]
  );

  const insertMedia = useCallback(async () => {
    if (!editor || !mediaPreview) return;

    const uploadedUrl = await uploadFileToAPI(mediaPreview.file);
    if (!uploadedUrl) {
      return;
    }

    if (onMediaUploadRef.current) {
      onMediaUploadRef.current(uploadedUrl);
    }

    if (mediaPreview.type === "image") {
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    } else {
      editor.chain().focus().setVideo({ src: uploadedUrl }).run();
    }

    setMediaPreview(null);
  }, [editor, mediaPreview, uploadFileToAPI]);

  const cancelMediaPreview = useCallback(() => {
    setMediaPreview(null);
  }, []);

  const handleMediaUpload = useCallback(
    (mediaType: "image" | "video") => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute(
        "accept",
        mediaType === "image" ? "image/*" : "video/*"
      );
      input.click();

      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          processFile(file);
        }
      };
    },
    [processFile]
  );

  const formatText = useCallback(
    (format: "bold" | "italic") => {
      if (!editor) return;

      if (format === "bold") {
        editor.chain().focus().toggleBold().run();
      } else {
        editor.chain().focus().toggleItalic().run();
      }
    },
    [editor]
  );

  const handleSend = useCallback(() => {
    if (onSend) {
      onSend();
    }
  }, [onSend]);

  const isBoldActive = editor?.isActive("bold") ?? false;
  const isItalicActive = editor?.isActive("italic") ?? false;
  const isEditorEmpty = editor?.isEmpty ?? true;

  if (!isClient) {
    return (
      <div className="whatsapp-editor-skeleton">
        <div className="skeleton-input"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <div
        ref={containerRef}
        className={`whatsapp-editor-wrapper ${isDragOver ? "drag-over" : ""}`}>
        {editorReady && editor ? (
          <div className="whatsapp-chat-container">
            {isUploading && (
              <div className="upload-overlay">
                <div className="upload-content">
                  <div className="upload-spinner"></div>
                  <p>Uploading...</p>
                </div>
              </div>
            )}

            {isDragOver && !isMobile && !isUploading && (
              <div className="drag-overlay">
                <div className="drag-content">
                  <Upload size={48} />
                  <p>Drop your image or video here</p>
                </div>
              </div>
            )}

            {mediaPreview && !isUploading && (
              <div className="media-preview-container">
                <div className="media-preview">
                  <button
                    type="button"
                    onClick={cancelMediaPreview}
                    className="preview-close-btn">
                    <X size={16} />
                  </button>

                  {mediaPreview.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaPreview.src}
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-video-container">
                      <video
                        src={mediaPreview.src}
                        className="preview-video"
                        controls
                      />
                      <div className="video-overlay">
                        <Play size={24} />
                      </div>
                    </div>
                  )}

                  <div className="preview-actions">
                    <button
                      type="button"
                      onClick={insertMedia}
                      className="preview-insert-btn"
                      disabled={isUploading}>
                      Upload & Insert {mediaPreview.type}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showToolbar && !mediaPreview && !isDragOver && !isUploading && (
              <div className="mini-toolbar">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className={`toolbar-btn ${isBoldActive ? "active" : ""}`}
                  title="Bold">
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className={`toolbar-btn ${isItalicActive ? "active" : ""}`}
                  title="Italic">
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowToolbar(false)}
                  className="toolbar-btn-close">
                  ×
                </button>
              </div>
            )}

            <div className="chat-input-container">
              <div className="input-actions-left">
                <button
                  type="button"
                  onClick={() => handleMediaUpload("image")}
                  className="action-btn"
                  title="Add Image"
                  aria-label="Add Image"
                  disabled={isUploading}>
                  <ImageIcon size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => handleMediaUpload("video")}
                  className="action-btn"
                  title="Add Video"
                  disabled={isUploading}>
                  <VideoIcon size={20} />
                </button>

                <button
                  type="button"
                  className="action-btn"
                  title="Attach File"
                  disabled={isUploading}>
                  <Paperclip size={20} />
                </button>
              </div>

              <div className="editor-container">
                <div className="whatsapp-editor">
                  <EditorContent editor={editor} className="tiptap-editor" />
                </div>

                {!isMobile && isEditorEmpty && !isUploading && (
                  <div className="drag-hint">or drag & drop media files</div>
                )}
              </div>

              {showSendButton && (
                <button
                  type="button"
                  onClick={handleSend}
                  className="send-btn"
                  title="Send"
                  disabled={isUploading}>
                  <Send size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="whatsapp-editor-skeleton">
            <div className="skeleton-input"></div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .whatsapp-editor-wrapper {
          max-width: 100%;
          margin: 0 auto;
          position: relative;
          transition: all 0.2s ease;
        }

        .whatsapp-editor-wrapper.drag-over {
          transform: scale(1.02);
        }

        .whatsapp-chat-container {
          background: #f0f2f5;
          border-radius: 20px;
          padding: 8px;
          position: relative;
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          animation: fadeIn 0.2s ease;
        }

        .upload-content {
          text-align: center;
          color: white;
          padding: 24px;
        }

        .upload-content p {
          margin: 12px 0 0 0;
          font-size: 16px;
          font-weight: 500;
        }

        .upload-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 168, 132, 0.9);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
          animation: dragFadeIn 0.2s ease;
        }

        @keyframes dragFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .drag-content {
          text-align: center;
          color: white;
          padding: 24px;
        }

        .drag-content p {
          margin: 12px 0 0 0;
          font-size: 16px;
          font-weight: 500;
        }

        .drag-hint {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 11px;
          color: #8696a0;
          pointer-events: none;
          opacity: 0.7;
        }

        .media-preview-container {
          position: absolute;
          top: -280px;
          left: 0;
          right: 0;
          z-index: 20;
          animation: slideUpPreview 0.3s ease;
        }

        @keyframes slideUpPreview {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .media-preview {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          position: relative;
          max-width: 320px;
          margin: 0 auto;
        }

        .preview-close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
        }

        .preview-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .preview-video-container {
          position: relative;
          margin-bottom: 12px;
        }

        .preview-video {
          width: 100%;
          max-height: 200px;
          border-radius: 12px;
        }

        .video-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .preview-actions {
          display: flex;
          justify-content: center;
        }

        .preview-insert-btn {
          background: #00a884;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .preview-insert-btn:hover:not(:disabled) {
          background: #008f72;
        }

        .preview-insert-btn:disabled {
          background: #8696a0;
          cursor: not-allowed;
        }

        .mini-toolbar {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 20px;
          padding: 8px 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .toolbar-btn {
          padding: 6px 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #54656f;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .toolbar-btn.active {
          background: #e2f3ef;
          color: #00a884;
        }

        .toolbar-btn:hover {
          background: #f0f2f5;
          color: #00a884;
        }

        .toolbar-btn-close {
          padding: 2px 6px;
          border: none;
          background: transparent;
          color: #8696a0;
          font-size: 18px;
          cursor: pointer;
          margin-left: 4px;
        }

        .chat-input-container {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: white;
          border-radius: 20px;
          padding: 8px 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .input-actions-left {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .action-btn {
          padding: 8px;
          border: none;
          background: transparent;
          color: #8696a0;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover:not(:disabled) {
          background: #f0f2f5;
          color: #00a884;
        }

        .action-btn:disabled {
          color: #bcc4cc;
          cursor: not-allowed;
        }

        .editor-container {
          flex: 1;
          min-height: 20px;
          max-height: 120px;
          position: relative;
        }

        .whatsapp-editor {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .whatsapp-editor .tiptap-editor {
          border: none;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror {
          border: none;
          outline: none;
          padding: 8px 12px;
          font-size: 15px;
          line-height: 1.4;
          color: #111b21;
          min-height: 20px;
          max-height: 120px;
          overflow-y: auto;
          word-wrap: break-word;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror p {
          margin: 0;
          padding: 0;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror.is-editor-empty::before {
          color: #8696a0;
          font-style: normal;
          left: 12px;
          font-size: 15px;
        }

        .send-btn {
          padding: 10px;
          border: none;
          background: #00a884;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
        }

        .send-btn:hover:not(:disabled) {
          background: #008f72;
          transform: scale(1.05);
        }

        .send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-btn:disabled {
          background: #8696a0;
          cursor: not-allowed;
          transform: none;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror img {
          max-width: 250px;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror img:hover {
          transform: scale(1.02);
        }

        .whatsapp-editor .tiptap-editor .ProseMirror video,
        .whatsapp-editor .tiptap-editor .ProseMirror .editor-video {
          max-width: 100%;
          width: 100%;
          max-width: 300px;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: block;
          background: #000;
        }

        .whatsapp-editor-skeleton {
          background: #f0f2f5;
          border-radius: 20px;
          padding: 8px;
        }

        .skeleton-input {
          height: 56px;
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 20px;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .whatsapp-chat-container {
            border-radius: 16px;
            padding: 6px;
          }

          .chat-input-container {
            border-radius: 16px;
            padding: 6px 10px;
          }

          .whatsapp-editor .tiptap-editor .ProseMirror {
            font-size: 16px;
            padding: 6px 8px;
          }

          .whatsapp-editor .tiptap-editor .ProseMirror.is-editor-empty::before {
            left: 8px;
            font-size: 16px;
          }

          .mini-toolbar {
            top: -45px;
            padding: 6px 10px;
          }

          .action-btn {
            padding: 6px;
          }

          .send-btn {
            min-width: 36px;
            min-height: 36px;
            padding: 8px;
          }

          .whatsapp-editor .tiptap-editor .ProseMirror img {
            max-width: 200px;
          }

          .whatsapp-editor .tiptap-editor .ProseMirror video {
            max-width: 250px;
          }

          .media-preview-container {
            top: -250px;
          }

          .media-preview {
            max-width: 280px;
            padding: 12px;
          }

          .preview-image,
          .preview-video {
            max-height: 150px;
          }

          .drag-hint {
            display: none;
          }
        }

        .whatsapp-editor .tiptap-editor .ProseMirror::-webkit-scrollbar {
          width: 4px;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror::-webkit-scrollbar-track {
          background: transparent;
        }

        .whatsapp-editor .tiptap-editor .ProseMirror::-webkit-scrollbar-thumb {
          background: #8696a0;
          border-radius: 2px;
        }

        .whatsapp-editor
          .tiptap-editor
          .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #54656f;
        }
      `}</style>
    </>
  );
}
