"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface QuillContentRendererProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

/**
 * Component to safely render Quill editor content including videos
 * This component parses the HTML and properly renders video tags
 */
export default function QuillContentRenderer({
  content,
  className = "",
  maxHeight,
}: QuillContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && content) {
      // Set the innerHTML to render Quill content
      contentRef.current.innerHTML = content;

      // Find all video elements and ensure they have proper attributes
      const videos = contentRef.current.querySelectorAll("video");
      videos.forEach((video) => {
        if (!video.hasAttribute("controls")) {
          video.setAttribute("controls", "");
        }
        if (!video.hasAttribute("playsinline")) {
          video.setAttribute("playsinline", "");
        }
        // Ensure video has proper styling
        if (!video.style.maxWidth) {
          video.style.maxWidth = "100%";
          video.style.borderRadius = "8px";
          video.style.margin = "8px 0";
        }
      });
    }
  }, [content]);

  return (
    <>
      <div
        ref={contentRef}
        className={`quill-content-renderer ${className}`}
        style={{ maxHeight: maxHeight || "none", overflow: "auto" }}
      />

      {/* Styling for rendered Quill content */}
      <style jsx global>{`
        .quill-content-renderer {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .quill-content-renderer p {
          margin: 0.5em 0;
        }

        .quill-content-renderer img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quill-content-renderer video,
        .quill-content-renderer video.ql-video {
          max-width: 100%;
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: block;
          background: #000;
        }

        .quill-content-renderer strong {
          font-weight: bold;
        }

        .quill-content-renderer em {
          font-style: italic;
        }

        .quill-content-renderer ul,
        .quill-content-renderer ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .quill-content-renderer li {
          margin: 0.25em 0;
        }

        .quill-content-renderer a {
          color: #00a884;
          text-decoration: underline;
        }

        .quill-content-renderer a:hover {
          color: #008f72;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .quill-content-renderer video,
          .quill-content-renderer video.ql-video {
            max-width: 100%;
          }

          .quill-content-renderer img {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
