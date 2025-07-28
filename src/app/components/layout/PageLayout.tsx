// src/app/components/layout/PageLayout.tsx
interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showChat?: boolean;
  title?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showSidebar = true,
  showChat = true,
  title,
}) => {
  return (
    <>
      <Navbar />
      <div className="flex bg-gray-100 min-h-screen">
        {showSidebar && (
          <div className="sticky top-0 h-screen z-30">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 p-4">
          {title && (
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            </header>
          )}
          {children}
        </main>
        {showChat && (
          <div className="sticky top-0 h-screen z-30">
            <ChatSidebar />
          </div>
        )}
      </div>
    </>
  );
};
