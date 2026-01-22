// src/app/components/layout/PageLayout.tsx
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
// import { ChatSidebar } from "@/components/features/chat/ChatSidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  showChat?: boolean;
  title?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showChat = true,
  title,
}) => {
  return (
    <>
      <Navbar />
      <div className="flex bg-gray-100 min-h-screen">
        <main className="flex-1 p-4">
          {title && (
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            </header>
          )}
          {children}
        </main>
        {showChat && (
          <></>
          // <div className="sticky top-0 h-screen z-30">
          //   <ChatSidebar />
          // </div>
        )}
      </div>
    </>
  );
};
