"use client";

import { useEffect, useRef } from "react";

interface RichTextRendererProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

/**
 * Safely render HTML produced by the Tiptap editor including uploaded videos and images
 */
export default function RichTextRenderer({
  content,
  className = "",
  maxHeight,
}: RichTextRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.innerHTML = content || "";

    const videos = contentRef.current.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.hasAttribute("controls")) {
        video.setAttribute("controls", "");
      }
      if (!video.hasAttribute("playsinline")) {
        video.setAttribute("playsinline", "");
      }
      if (!video.classList.contains("rendered-video")) {
        video.classList.add("rendered-video");
      }
    });
  }, [content]);

  return (
    <>
      <div
        ref={contentRef}
        className={`richtext-content-renderer ${className}`}
        style={{ maxHeight: maxHeight || "none", overflow: "auto" }}
      />

      <style jsx global>{`
        .richtext-content-renderer {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .richtext-content-renderer p {
          margin: 0.5em 0;
        }

        .richtext-content-renderer img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .richtext-content-renderer video,
        .richtext-content-renderer video.rendered-video {
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

        .richtext-content-renderer strong {
          font-weight: bold;
        }

        .richtext-content-renderer em {
          font-style: italic;
        }

        .richtext-content-renderer ul,
        .richtext-content-renderer ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .richtext-content-renderer li {
          margin: 0.25em 0;
        }

        .richtext-content-renderer a {
          color: #00a884;
          text-decoration: underline;
        }

        .richtext-content-renderer a:hover {
          color: #008f72;
        }

        @media (max-width: 768px) {
          .richtext-content-renderer video,
          .richtext-content-renderer video.rendered-video {
            max-width: 100%;
          }

          .richtext-content-renderer img {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
