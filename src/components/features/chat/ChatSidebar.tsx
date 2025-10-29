import React from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";

interface User {
  id: string;
  username: string;
  email: string;
  affiliatedMosqueId?: number;
}

interface ChatSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ChatSidebar = ({
  isOpen = false, // ✅ Change default to false
  onClose,
  className = "",
}: ChatSidebarProps) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        setCurrentUser(auth.data.user);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch contacts
  const loadContacts = async () => {
    if (!currentUser) return;

    try {
      const response = await axiosInstance.get<User[]>("/api/chat/users");
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      try {
        const fallbackResponse = await axiosInstance.get<User[]>(
          "/api/admin/users"
        );
        if (fallbackResponse.data) {
          const filteredUsers = fallbackResponse.data.filter(
            (user) => user.id !== currentUser?.id
          );
          setUsers(filteredUsers);
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentUser) {
      loadContacts();
    }
  }, [currentUser]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle user click - navigate directly to message page
  const handleUserClick = (userId: string) => {
    // Save selected user to sessionStorage for immediate loading
    sessionStorage.setItem("selectedUserId", userId);

    // Close modal if on mobile
    if (onClose) {
      onClose();
    }

    // Navigate to message page without query parameter
    router.push("/message");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Desktop version - always show, tidak pakai isOpen
  const DesktopSidebar = () => (
    <aside
      className={`hidden lg:flex w-80 bg-white border-l border-gray-200 h-screen flex-col shadow-lg ${className}`}
    >
      <SidebarContent />
    </aside>
  );

  // Mobile modal version - pakai isOpen
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose} // ✅ Auto close when click overlay
        />
      )}

      {/* Modal */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );

  // Shared content component
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Contacts</h2>
              <p className="text-xs text-blue-100">
                {filteredUsers.length} available
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 w-4 h-4 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 text-sm">Loading contacts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197V9a3 3 0 00-6 0v2.197"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </h3>
            <p className="text-gray-500 text-sm text-center">
              {searchQuery
                ? "Try searching with a different keyword"
                : "Start connecting with other users to see them here"}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-white transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {getInitials(user.username)}
                </div>

                {/* User Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>

                {/* Online indicator & Badge */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-medium">New Group</span>
          </button>

          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};
