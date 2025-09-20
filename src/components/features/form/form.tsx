"use client";

import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  Send,
  Image,
  Video,
  Paperclip,
  Bold,
  Italic,
  X,
  Play,
  Upload,
} from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";

// Define types for props
interface MyEditorProps {
  value?: string;
  onEditorChange: (content: string) => void;
  onSend?: () => void;
  onMediaUpload?: (mediaUrl: string) => void; // New prop for handling uploaded media URLs
  uploadEndpoint?: string; // Custom upload endpoint
  showSendButton?: boolean; // Option to hide send button
}

export default function MyEditor({
  value,
  onEditorChange,
  onSend,
  onMediaUpload,
  uploadEndpoint = "/api/upload-media", // Default endpoint
  showSendButton = true,
}: MyEditorProps) {
  const [editorLoaded, setEditorLoaded] = useState(false);
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
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
    setEditorLoaded(true);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isClient && editorLoaded && editorRef.current && !quillRef.current) {
      const quillInstance = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Type a message...",
        modules: {
          toolbar: false, // We'll use custom toolbar
        },
      });

      quillRef.current = quillInstance;

      // Handle text changes
      quillInstance.on("text-change", () => {
        const content = quillInstance.root.innerHTML || "";
        onEditorChange(content);
      });

      // Set initial value if provided
      if (value) {
        quillInstance.root.innerHTML = value;
      }

      // Focus handler
      quillInstance.on("selection-change", (range) => {
        if (range) {
          setShowToolbar(true);
        }
      });
    }
  }, [isClient, editorLoaded, onEditorChange]);

  // Drag & Drop handlers
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

      // Only set dragOver to false if we're leaving the container entirely
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
  }, [isClient, isMobile]);

  // Sync external value changes to editor
  useEffect(() => {
    if (
      quillRef.current &&
      value !== undefined &&
      value !== quillRef.current.root.innerHTML
    ) {
      const currentSelection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || "";

      if (currentSelection) {
        quillRef.current.setSelection(currentSelection);
      }
    }
  }, [value]);

  // API Upload function
  const uploadFileToAPI = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("source", "marketplace"); // or make this dynamic

      const response = await axiosInstance.post(uploadEndpoint, formData);

      // Axios automatically throws for non-2xx responses
      // and parses JSON response data
      return response.data.data?.url || response.data.url || null; // Handle different response formats
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = (file: File) => {
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
  };

  const handleMediaUpload = (mediaType: "image" | "video") => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", mediaType === "image" ? "image/*" : "video/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        processFile(file);
      }
    };
  };

  const insertMedia = async () => {
    if (!mediaPreview || !quillRef.current) return;

    // Upload to API first
    const uploadedUrl = await uploadFileToAPI(mediaPreview.file);

    if (!uploadedUrl) {
      return; // Upload failed, don't insert
    }

    // Call the onMediaUpload callback if provided
    if (onMediaUpload) {
      onMediaUpload(uploadedUrl);
    }

    const range = quillRef.current.getSelection() || {
      index: quillRef.current.getLength(),
    };

    if (mediaPreview.type === "image") {
      // Insert image with uploaded URL
      quillRef.current.insertEmbed(range.index, "image", uploadedUrl);
    } else if (mediaPreview.type === "video") {
      // Insert video with uploaded URL
      const videoHtml = `
        <div class="video-container" contenteditable="false">
          <video controls style="max-width: 100%; border-radius: 8px; margin: 8px 0;">
            <source src="${uploadedUrl}" type="${mediaPreview.file.type}">
            Your browser does not support the video tag.
          </video>
        </div>
      `;

      // Insert as HTML
      const delta = quillRef.current.clipboard.convert(videoHtml);
      quillRef.current.setContents(
        quillRef.current.getContents().compose(delta.slice(0))
      );
    }

    setMediaPreview(null);
    quillRef.current.setSelection({ index: range.index + 1, length: 0 });
  };

  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  const formatText = (format: string) => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.format(format, !quillRef.current.getFormat()[format]);
      }
    }
  };

  const handleSend = () => {
    if (onSend) {
      onSend();
    }
  };

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="whatsapp-editor-skeleton">
        <div className="skeleton-input"></div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`whatsapp-editor-wrapper ${isDragOver ? "drag-over" : ""}`}
      >
        {editorLoaded ? (
          <div className="whatsapp-chat-container">
            {/* Upload Loading Overlay */}
            {isUploading && (
              <div className="upload-overlay">
                <div className="upload-content">
                  <div className="upload-spinner"></div>
                  <p>Uploading...</p>
                </div>
              </div>
            )}

            {/* Drag & Drop Overlay */}
            {isDragOver && !isMobile && !isUploading && (
              <div className="drag-overlay">
                <div className="drag-content">
                  <Upload size={48} />
                  <p>Drop your image or video here</p>
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaPreview && !isUploading && (
              <div className="media-preview-container">
                <div className="media-preview">
                  <button
                    type="button" // Add this
                    onClick={cancelMediaPreview}
                    className="preview-close-btn"
                  >
                    <X size={16} />
                  </button>

                  {mediaPreview.type === "image" ? (
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
                      type="button" // Add this
                      onClick={insertMedia}
                      className="preview-insert-btn"
                      disabled={isUploading}
                    >
                      Upload & Insert {mediaPreview.type}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mini Toolbar (appears when typing) */}
            {showToolbar && !mediaPreview && !isDragOver && !isUploading && (
              <div className="mini-toolbar">
                <button
                  type="button" // Add this
                  onClick={() => formatText("bold")}
                  className="toolbar-btn"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button" // Add this
                  onClick={() => formatText("italic")}
                  className="toolbar-btn"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button" // Add this
                  onClick={() => setShowToolbar(false)}
                  className="toolbar-btn-close"
                >
                  ×
                </button>
              </div>
            )}

            {/* Main Input Container */}
            <div className="chat-input-container">
              {/* Left Actions */}
              <div className="input-actions-left">
                <button
                  type="button" // Add this
                  onClick={() => handleMediaUpload("image")}
                  className="action-btn"
                  title="Add Image"
                  disabled={isUploading}
                >
                  <Image size={20} />
                </button>

                <button
                  type="button" // Add this
                  onClick={() => handleMediaUpload("video")}
                  className="action-btn"
                  title="Add Video"
                  disabled={isUploading}
                >
                  <Video size={20} />
                </button>

                <button
                  type="button" // Add this
                  className="action-btn"
                  title="Attach File"
                  disabled={isUploading}
                >
                  <Paperclip size={20} />
                </button>
              </div>

              {/* Editor */}
              <div className="editor-container">
                <div ref={editorRef} className="whatsapp-editor" />

                {/* Drag hint for desktop */}
                {!isMobile && !value && !isUploading && (
                  <div className="drag-hint">or drag & drop media files</div>
                )}
              </div>

              {/* Send Button */}
              {showSendButton && (
                <button
                  type="button" // Add this
                  onClick={handleSend}
                  className="send-btn"
                  title="Send"
                  disabled={isUploading}
                >
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

      {/* WhatsApp-like styling */}
      <style jsx global>{`
        /* Main Container */
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

        /* Upload Loading Overlay */
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

        /* Drag & Drop Overlay */
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

        /* Drag Hint */
        .drag-hint {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 11px;
          color: #8696a0;
          pointer-events: none;
          opacity: 0.7;
        }

        /* Media Preview */
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

        /* Mini Toolbar */
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

        /* Chat Input Container */
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

        /* Left Actions */
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

        /* Editor Container */
        .editor-container {
          flex: 1;
          min-height: 20px;
          max-height: 120px;
          position: relative;
        }

        .whatsapp-editor .ql-container {
          border: none !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .whatsapp-editor .ql-editor {
          border: none;
          padding: 8px 12px;
          font-size: 15px;
          line-height: 1.4;
          color: #111b21;
          min-height: 20px;
          max-height: 120px;
          overflow-y: auto;
          word-wrap: break-word;
        }

        .whatsapp-editor .ql-editor.ql-blank::before {
          color: #8696a0;
          font-style: normal;
          left: 12px;
          font-size: 15px;
        }

        .whatsapp-editor .ql-editor p {
          margin: 0;
          padding: 0;
        }

        /* Send Button */
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

        /* Media Styling in Editor */
        .whatsapp-editor .ql-editor img {
          max-width: 250px;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .whatsapp-editor .ql-editor img:hover {
          transform: scale(1.02);
        }

        .whatsapp-editor .ql-editor .video-container {
          margin: 8px 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .whatsapp-editor .ql-editor video {
          width: 100%;
          max-width: 300px;
          height: auto;
          display: block;
        }

        /* Skeleton Loading */
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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .whatsapp-chat-container {
            border-radius: 16px;
            padding: 6px;
          }

          .chat-input-container {
            border-radius: 16px;
            padding: 6px 10px;
          }

          .whatsapp-editor .ql-editor {
            font-size: 16px; /* Prevent zoom on iOS */
            padding: 6px 8px;
          }

          .whatsapp-editor .ql-editor.ql-blank::before {
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

          .whatsapp-editor .ql-editor img {
            max-width: 200px;
          }

          .whatsapp-editor .ql-editor video {
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

        /* Scrollbar untuk editor */
        .whatsapp-editor .ql-editor::-webkit-scrollbar {
          width: 4px;
        }

        .whatsapp-editor .ql-editor::-webkit-scrollbar-track {
          background: transparent;
        }

        .whatsapp-editor .ql-editor::-webkit-scrollbar-thumb {
          background: #8696a0;
          border-radius: 2px;
        }

        .whatsapp-editor .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #54656f;
        }
      `}</style>
    </>
  );
}
