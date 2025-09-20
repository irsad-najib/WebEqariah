"use client";

import { useWebSocket } from "@/lib/hooks/useWs";
import { axiosInstance } from "@/lib/utils/api";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import MyEditor from "@/components/features/form/form";

interface Message {
  id: number;
  content: string;
  type: string;
  media_url?: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  affiliatedMosqueId?: number;
}

const MessagePage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get query parameters
  const searchParams = useSearchParams();
  const selectedUserFromQuery = searchParams.get("selectedUser");

  // Load selected user from sessionStorage on mount
  useEffect(() => {
    const savedSelectedUser = sessionStorage.getItem("selectedUserId");
    if (savedSelectedUser && !selectedUserFromQuery) {
      setSelectedUserId(savedSelectedUser);
    }
  }, [selectedUserFromQuery]);

  // Get current user
  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        setCurrentUser(auth.data.user);
        setLoading(false);
      } catch (error) {
        console.log("Auth error:", error);
        setLoading(false);
      }
    };
    authsession();
  }, []);

  // Handle query parameter dan clean URL
  useEffect(() => {
    if (selectedUserFromQuery) {
      setSelectedUserId(selectedUserFromQuery);
      setIsMobileMenuOpen(false);

      // Save to sessionStorage
      sessionStorage.setItem("selectedUserId", selectedUserFromQuery);

      // Clean URL by removing query parameter using window.history
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/message");
      }
    }
  }, [selectedUserFromQuery]);

  // Load chat history function dengan useCallback
  const loadChatHistory = useCallback(
    async (otherUserId: string) => {
      if (!currentUser || !otherUserId) return;
      try {
        const response = await axiosInstance.get<Message[]>(
          `/api/chat/history/${otherUserId}`
        );
        if (response.data) {
          setMessages(response.data);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        setMessages([]);
      }
    },
    [currentUser]
  );

  // Load users function dengan useCallback
  const loadUsers = useCallback(async () => {
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
    }
  }, [currentUser]);

  // Load users ketika currentUser ready
  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  // Load chat history ketika selectedUserId atau currentUser berubah
  useEffect(() => {
    if (selectedUserId && currentUser) {
      loadChatHistory(selectedUserId);
    } else if (!selectedUserId) {
      setMessages([]);
    }
  }, [selectedUserId, currentUser, loadChatHistory]);

  // Setup WebSocket connection
  const { connectionStatus, lastMessage } = useWebSocket(
    "ws://localhost:5000/api/ws",
    currentUser?.id
  );

  const truncateHtmlContent = (content: string) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const textContent = tempDiv.textContent || tempDiv.innerText;

    if (textContent.length <= 100) {
      return content; // Return original content if it's short enough
    }

    // Return shortened version for display
    return content.substring(0, 100) + "...";
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === "new_message") {
      const msgData = lastMessage.data as Message;

      const isRelevantMessage =
        (msgData.sender_id.toString() === selectedUserId.toString() &&
          msgData.receiver_id.toString() === currentUser?.id.toString()) ||
        (msgData.sender_id.toString() === currentUser?.id.toString() &&
          msgData.receiver_id.toString() === selectedUserId.toString());

      if (isRelevantMessage) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === msgData.id);
          if (exists) {
            return prev;
          }
          const newMessages = [...prev, msgData].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

          setTimeout(() => {
            scrollToBottom();
          }, 100);

          return newMessages;
        });
      }
    }
  }, [lastMessage, selectedUserId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle user selection with sessionStorage
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setIsMobileMenuOpen(false);
    sessionStorage.setItem("selectedUserId", userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || !currentUser) return;

    try {
      const messageData = {
        receiver_id: selectedUserId.toString(),
        content: newMessage,
        type: "text",
        media_url: "",
      };

      const response = await axiosInstance.post("/api/chat/send", messageData);

      if (response.data) {
        setNewMessage("");

        if (connectionStatus !== "Open") {
          const sentMessage: Message = {
            id: response.data.id || Date.now(),
            content: messageData.content,
            type: messageData.type,
            media_url: messageData.media_url,
            sender_id: parseInt(currentUser.id),
            receiver_id: parseInt(selectedUserId),
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, sentMessage]);
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("id-ID");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please login to access your messages</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="flex h-[calc(100vh-6rem)] sm:h-[700px]">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </button>

              {/* Users List Sidebar */}
              <div
                className={`${
                  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 fixed lg:relative z-40 w-80 lg:w-1/3 xl:w-1/4 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
              >
                {/* Sidebar Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Messages</h2>
                      <p className="text-blue-100 text-sm">
                        {users.length} contacts
                      </p>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="lg:hidden text-white hover:bg-white/20 p-2 rounded-full"
                    >
                      <svg
                        className="w-6 h-6"
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
                  </div>

                  {/* Connection Status */}
                  <div className="mt-3 flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        connectionStatus === "Open"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />
                    <span className="text-sm text-blue-100">
                      {connectionStatus === "Open"
                        ? "Connected"
                        : "Disconnected"}
                    </span>
                  </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No contacts found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Start by adding some contacts
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)} // Updated to use handleUserSelect
                        className={`p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:bg-gray-50 ${
                          selectedUserId === user.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              selectedUserId === user.id
                                ? "bg-blue-500"
                                : "bg-gradient-to-br from-purple-500 to-pink-500"
                            }`}
                          >
                            {getInitials(user.username)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Online indicator */}
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Overlay for mobile */}
              {isMobileMenuOpen && (
                <div
                  className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}

              {/* Chat Area - rest remains the same */}
              <div className="flex-1 flex flex-col">
                {selectedUserId ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(
                            users.find((u) => u.id === selectedUserId)
                              ?.username || "Unknown"
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {users.find((u) => u.id === selectedUserId)
                              ?.username || `User ${selectedUserId}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {users.find((u) => u.id === selectedUserId)
                              ?.email || "Loading..."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                              className="w-10 h-10 text-blue-500"
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
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Start the conversation!
                          </h3>
                          <p className="text-gray-500">
                            Send your first message to begin chatting
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => {
                            const isSender =
                              message.sender_id.toString() ===
                              currentUser.id.toString();
                            const showDate =
                              index === 0 ||
                              formatDate(message.created_at) !==
                                formatDate(messages[index - 1].created_at);

                            return (
                              <div key={message.id}>
                                {showDate && (
                                  <div className="flex justify-center my-6">
                                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                      {formatDate(message.created_at)}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`flex ${
                                    isSender ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                                      isSender
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                                    }`}
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: truncateHtmlContent(
                                          message.content
                                        ),
                                      }}
                                    />
                                    <p
                                      className={`text-xs mt-2 ${
                                        isSender
                                          ? "text-blue-100"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {formatTime(message.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="bg-white border-t border-gray-200 p-4">
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <MyEditor
                            value={newMessage}
                            onEditorChange={(content) => setNewMessage(content)}
                            onMediaUpload={(mediaUrl) =>
                              setNewMessage((prev) =>
                                prev
                                  ? prev + `<img src="${mediaUrl}" />`
                                  : `<img src="${mediaUrl}" />`
                              )
                            }
                            uploadEndpoint="/api/upload-media"
                            showSendButton={false} // gunakan tombol kirim eksternal agar styling konsisten
                          />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
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
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-12 h-12 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Welcome to Messages
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Select a contact from the sidebar to start a
                        conversation
                      </p>
                      <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Open Contacts
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagePage;
