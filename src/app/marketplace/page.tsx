"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, User, Heart, MessageCircle, ArrowUp } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";
import { useWebSocket } from "@/lib/hooks/useWs";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/features/chat/ChatSidebar";
import dynamic from "next/dynamic";

// Import MyEditor with dynamic import to prevent SSR issues
const MyEditor = dynamic(() => import("@/components/features/form/form"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
      <span className="ml-2 text-gray-600">Memuatkan editor...</span>
    </div>
  ),
});

const QuillContentRenderer = dynamic(
  () => import("@/components/features/form/QuillContentRenderer"),
  { ssr: false }
);

// Interface definitions
interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface NewMarketplaceItemForm {
  title: string;
  content: string;
  mediaUrl?: string;
}

interface MarketplaceItem {
  id: number;
  title: string;
  content: string;
  mediaUrl?: string;
  authorId: number;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  likedByUser?: boolean;
}

interface MarketplaceComment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

export default function MarketplacePage() {
  // State declarations
  const [newMarketplaceItem, setNewMarketplaceItem] =
    useState<NewMarketplaceItemForm>({
      title: "",
      content: "",
    });
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(
    []
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [commentOpen, setCommentOpen] = useState<number | null>(null);
  const [comments, setComments] = useState<{
    [key: number]: MarketplaceComment[];
  }>({});
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [fullContentModal, setFullContentModal] = useState<number | null>(null);

  // Chat sidebar states
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Add new state for expanded content
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  // Add state to track which items need expand button (client-side only)
  const [itemsNeedExpand, setItemsNeedExpand] = useState<{
    [key: number]: boolean;
  }>({});

  // Add state to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        if (auth.data.Authenticated === true) {
          setIsAuthenticated(true);
          setCurrentUser(auth.data.user);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const fetchMarketplaceItems = async () => {
      try {
        const response = await axiosInstance.get("/api/marketplace");
        setMarketplaceItems(sortMarketplaceItemsByLatest(response.data));
      } catch (error) {
        console.error("Error fetching marketplace items:", error);
      }
    };

    checkAuth();
    fetchMarketplaceItems();
  }, []);

  // Effect to check content length on client side only
  useEffect(() => {
    if (!isMounted) return;

    const checkContentLength = () => {
      const newItemsNeedExpand: { [key: number]: boolean } = {};

      marketplaceItems.forEach((item) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = item.content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        const lines = textContent.split("\n").length;
        newItemsNeedExpand[item.id] = lines > 4 || textContent.length > 200;
      });

      setItemsNeedExpand(newItemsNeedExpand);
    };

    if (marketplaceItems.length > 0) {
      checkContentLength();
    }
  }, [marketplaceItems, isMounted]);

  // Handler for title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMarketplaceItem({
      ...newMarketplaceItem,
      title: e.target.value,
    });
  };

  // New handler for editor content changes
  const handleEditorChange = (content: string) => {
    setNewMarketplaceItem((prev) => ({
      ...prev,
      content,
    }));
  };

  // Handler for media uploads from editor
  const handleMediaUpload = (mediaUrl: string) => {
    setNewMarketplaceItem((prev) => ({
      ...prev,
      mediaUrl,
    }));
  };

  const handleMarketplaceItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!currentUser) {
      setError({
        general: "Anda mesti login masuk untuk memuatkan item",
      });
      setLoading(false);
      return;
    }

    try {
      const itemData = {
        ...newMarketplaceItem,
        authorId: currentUser.id, // Include the author ID from current user
      };

      const createMarketplaceItem = await axiosInstance.post(
        "/api/marketplace",
        itemData,
        {
          withCredentials: true,
        }
      );

      setSuccess("Item pasaran berjaya dicipta!");

      // Immediate UX update: add returned item to state if not present
      const created = createMarketplaceItem.data;
      if (created) {
        const createdId =
          Number(created.id || created.ID || created.item_id || 0) ||
          Date.now();
        setMarketplaceItems((prev) => {
          const exists = prev.some((i) => i.id === createdId);
          if (exists) return prev;
          const newItem: MarketplaceItem = {
            id: createdId,
            title: created.title || created.name || "",
            content: created.content || "",
            mediaUrl: created.media_url || created.mediaUrl,
            authorId:
              Number(created.author_id || created.authorId || currentUser.id) ||
              0,
            authorName:
              created.author_name || created.authorName || currentUser.username,
            likeCount: Number(created.like_count || created.likeCount || 0),
            commentCount: Number(
              created.comment_count || created.commentCount || 0
            ),
            createdAt: created.created_at || new Date().toISOString(),
            updatedAt: created.updated_at || new Date().toISOString(),
          };
          return sortMarketplaceItemsByLatest([newItem, ...prev]);
        });
      }

      setNewMarketplaceItem({
        title: "",
        content: "",
        mediaUrl: "",
      });
    } catch (err) {
      console.error("Error semasa mencipta item pasaran:", err);
      setError({
        general: "Gagal mencipta item pasaran:" + (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append("image", file);
    setUploading(true);

    try {
      const response = await axiosInstance.post(
        "/api/upload-media",
        formDataImage,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setNewMarketplaceItem((prev) => ({
          ...prev,
          mediaUrl: response.data.url,
        }));
        setError((prev) => ({ ...prev, imageUrl: "" }));
        setIsOpen(false);
        setPreview(null);
        setFile(null);
      } else {
        throw new Error(response.data.message || "Muat naik gagal");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error muat naik imej";
      setError((prev) => ({
        ...prev,
        imageUrl: errorMessage,
      }));
    } finally {
      setUploading(false);
    }
  };

  // Handle liking an item
  const handleLike = async (itemId: number) => {
    if (!isAuthenticated) {
      setError({ general: "Anda mesti login masuk untuk menyukai item" });
      return;
    }

    setLoadingLike((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await axiosInstance.post(
        `/api/announcement/${itemId}/like`,
        {},
        { withCredentials: true }
      );

      // Update the marketplace item with new like count
      setMarketplaceItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              likeCount: response.data.likeCount,
              likedByUser: !item.likedByUser,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error menyukai item:", error);
      setError({
        general: "Gagal menyukai item: " + (error as Error).message,
      });
    } finally {
      setLoadingLike((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Toggle comment section
  const toggleComments = async (itemId: number) => {
    if (commentOpen === itemId) {
      setCommentOpen(null);
      return;
    }

    setCommentOpen(itemId);

    // Only fetch comments if not already loaded
    if (!comments[itemId]) {
      setLoadingComments(true);
      try {
        const response = await axiosInstance.get(
          `/api/announcement/${itemId}/comments`,
          { withCredentials: true }
        );
        setComments((prev) => ({ ...prev, [itemId]: response.data }));
      } catch (error) {
        console.error("Error semasa mengambil komen:", error);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Add comment to an item
  const handleAddComment = async (itemId: number) => {
    if (!isAuthenticated) {
      setError({ general: "Anda mesti login masuk untuk komen" });
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoadingComments(true);
    try {
      const response = await axiosInstance.post(
        `/api/announcement/${itemId}/comments`,
        { content: newComment },
        { withCredentials: true }
      );

      // Add the new comment to the comments list
      const newCommentObject = response.data.comment;
      setComments((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), newCommentObject],
      }));

      // Update the comment count in the marketplace item
      setMarketplaceItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              commentCount: item.commentCount + 1,
            };
          }
          return item;
        })
      );

      // Reset the new comment field
      setNewComment("");
    } catch (error) {
      console.error("Error menambah komen:", error);
      setError({
        general: "Gagal menambah komen: " + (error as Error).message,
      });
    } finally {
      setLoadingComments(false);
    }
  };

  // helper simple untuk sort terbaru
  const sortMarketplaceItemsByLatest = (items: MarketplaceItem[]) =>
    [...items].sort((a, b) => b.id - a.id);

  // WebSocket hook untuk menerima update real-time
  const { connectionStatus, lastMessage } = useWebSocket(
    "wss://api.eqariah.com/api/ws",
    "marketplace" // Special subscription for marketplace
  );

  // Replace your existing WebSocket effect with this improved version
  useEffect(() => {
    if (!lastMessage) return;

    try {
      // normalisasi payload (string / object / wrapper {type, data})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: any =
        typeof lastMessage === "string" ? JSON.parse(lastMessage) : lastMessage;
      if (payload && payload.type && payload.data) payload = payload.data;

      // pastikan ada id/title/content minimal
      if (!payload || (payload.id === undefined && !payload.title)) {
        console.warn("WS payload tidak cocok:", payload);
        return;
      }

      const newItem: MarketplaceItem = {
        id: Number(payload.id) || Date.now(),
        title: payload.title || "",
        content: payload.content || "",
        mediaUrl: payload.media_url || payload.mediaUrl,
        authorId: Number(payload.author_id || payload.authorId || 0),
        authorName: payload.author_name || payload.authorName || "Anonymous",
        likeCount: Number(payload.like_count || payload.likeCount || 0),
        commentCount: Number(
          payload.comment_count || payload.commentCount || 0
        ),
        createdAt:
          payload.created_at || payload.createdAt || new Date().toISOString(),
        updatedAt:
          payload.updated_at || payload.updatedAt || new Date().toISOString(),
      };

      setMarketplaceItems((prev) => {
        // immutably add hanya kalau belum ada
        const exists = prev.some(
          (i) =>
            i.id === newItem.id ||
            (i.title === newItem.title &&
              i.content === newItem.content &&
              i.authorId === newItem.authorId)
        );
        if (exists) return prev;
        return sortMarketplaceItemsByLatest([newItem, ...prev]);
      });

      setSuccess("Item pasaran baru diterima");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      console.error("Gagal memproses mesej WS:", err);
    }
  }, [lastMessage]);

  // Function to toggle content expansion
  const toggleContentExpansion = (itemId: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Replace the shouldShowExpand function with this simpler version
  const shouldShowExpand = (itemId: number) => {
    return itemsNeedExpand[itemId] || false;
  };

  // Function to open the full content modal
  const openFullContentModal = (itemId: number) => {
    setFullContentModal(itemId);
  };

  // Function to close the full content modal
  const closeFullContentModal = () => {
    setFullContentModal(null);
  };

  // Don't render until mounted (client-side only)
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-200 text-black">
      <Navbar />

      {/* Main Content Container */}
      <div className="lg:pr-80">
        <div className="container mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-bold mb-8">Marketplace</h1>

          {/* WebSocket Status Indicator */}
          <div className="mb-4 flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                connectionStatus ? "bg-green-500" : "bg-red-500"
              }`}></span>
            <span className="text-sm text-gray-600">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* User Status Banner */}
          <div className="mb-6">
            {isAuthenticated && currentUser ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-800">
                    Posting as{" "}
                    <span className="font-semibold">
                      {currentUser.username}
                    </span>
                  </p>
                  <p className="text-sm text-blue-600">
                    Item anda akan memaparkan nama pengguna anda
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Login untuk menyiarkan item pasaran anda sendiri.
                </p>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && Object.keys(error).length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {Object.values(error).map((errMsg, index) => (
                <p key={index}>{errMsg}</p>
              ))}
            </div>
          )}

          {/* Success display */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Create Marketplace Item Form - Available for all authenticated users */}
          {isAuthenticated && (
            <div className="bg-white text-black shadow-md rounded-lg mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Cipta Item Pasaran Baru
                </h2>
              </div>

              <form
                onSubmit={handleMarketplaceItemSubmit}
                className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="title"
                    value={newMarketplaceItem.title}
                    onChange={handleTitleChange}
                    placeholder="Title"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Replace textarea with MyEditor component */}
                <div className="mt-2">
                  <MyEditor
                    value={newMarketplaceItem.content}
                    onEditorChange={handleEditorChange}
                    onMediaUpload={handleMediaUpload}
                    uploadEndpoint="/api/upload-media"
                    showSendButton={false}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-6">
                  {loading ? "Loading..." : "Post Item"}
                </button>
              </form>
            </div>
          )}

          {/* Image Upload Modal */}
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsOpen(false)}
              />

              <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Muat naik gambar untuk item anda (Optional)
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  Pilih dan pratonton gambar anda sebelum memuat naik
                </p>
                <p className="text-sm text-gray-500">Max size image 5 MB</p>
                <p className="text-sm text-gray-500 mb-4">
                  Format file: png, jpg, jpeg, heic, and heif
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="item-image-modal"
                    />
                    <label
                      htmlFor="item-image-modal"
                      className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer">
                      <Upload className="h-6 w-6 mb-2" />
                      Pilih Gambar
                    </label>
                  </div>

                  {error?.imageUrl && (
                    <p className="text-red-500 text-sm text-center">
                      {error.imageUrl}
                    </p>
                  )}

                  {preview && (
                    <div className="space-y-4">
                      <div className="relative w-full h-96">
                        <Image
                          src={preview}
                          alt="Preview"
                          className="rounded-md object-cover"
                          fill
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setFile(null);
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={uploading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
                          {uploading ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Marketplace Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceItems.length > 0 ? (
              marketplaceItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col min-h-[400px]" // Changed to min-h instead of fixed h
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Title - Fixed height */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem]">
                      {item.title}
                    </h3>

                    {/* Description with line-based limitation */}
                    <div className="text-gray-700 mb-4 flex-1">
                      <div
                        className={`prose max-w-none text-sm leading-relaxed break-words transition-all duration-300 overflow-hidden ${
                          // Line clamp based on expansion state
                          !expandedItems[item.id] && shouldShowExpand(item.id)
                            ? "line-clamp-4"
                            : ""
                        }`}
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          hyphens: "auto",
                        }}>
                        <QuillContentRenderer content={item.content} />
                      </div>

                      {/* Action buttons for long content */}
                      {shouldShowExpand(item.id) && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => toggleContentExpansion(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors">
                            {expandedItems[item.id] ? "Show less" : "Show more"}
                          </button>

                          <button
                            onClick={() => openFullContentModal(item.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-full transition-colors">
                            Full view
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Author Info - Fixed height */}
                    <div className="flex items-center mb-4 min-h-[2.5rem]">
                      <div className="bg-gray-100 rounded-full p-2 mr-2">
                        <User size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {item.authorName || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Current user badge */}
                      {currentUser &&
                        parseInt(currentUser.id) === item.authorId && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            Barangan Anda
                          </span>
                        )}
                    </div>

                    {/* Like and Comment buttons - Fixed at bottom */}
                    <div className="flex items-center border-t border-gray-100 pt-3 mt-auto">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(item.id)}
                        disabled={loadingLike[item.id]}
                        className={`flex items-center mr-6 focus:outline-none group ${
                          item.likedByUser
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}>
                        <Heart
                          className={`h-5 w-5 mr-1 ${
                            item.likedByUser
                              ? "fill-red-500"
                              : "fill-transparent group-hover:fill-red-200"
                          } transition-all`}
                        />
                        <span className="text-sm">{item.likeCount}</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => toggleComments(item.id)}
                        className="flex items-center text-gray-500 hover:text-blue-500 focus:outline-none group">
                        <MessageCircle className="h-5 w-5 mr-1 group-hover:text-blue-500" />
                        <span className="text-sm">{item.commentCount}</span>
                      </button>
                    </div>

                    {/* Comments Section - Outside the fixed height container */}
                    {commentOpen === item.id && (
                      <div className="mt-4 border-t border-gray-100 pt-4 -mx-6 -mb-6 px-6 pb-6 bg-gray-50">
                        <h4 className="text-sm font-semibold mb-3">Komen</h4>

                        {/* Comments List */}
                        {loadingComments ? (
                          <div className="text-center py-4">
                            <div className="spinner w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">
                              Memuat komen...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {comments[item.id]?.length ? (
                              comments[item.id].map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-white p-3 rounded-md shadow-sm">
                                  <div className="flex items-center mb-1">
                                    <div className="bg-gray-200 rounded-full p-1 mr-2">
                                      <User
                                        size={12}
                                        className="text-gray-500"
                                      />
                                    </div>
                                    <span className="text-xs font-medium truncate flex-1">
                                      {comment.authorName}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm break-words">
                                    {comment.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">
                                Tiada komen lagi
                              </p>
                            )}
                          </div>
                        )}

                        {/* Add Comment Form */}
                        {isAuthenticated && (
                          <div className="mt-3 flex">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && newComment.trim()) {
                                  handleAddComment(item.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(item.id)}
                              disabled={!newComment.trim() || loadingComments}
                              className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300 text-sm">
                              Pos
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-6 rounded-lg text-center shadow-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Tiada Item Pasaran Lagi
                </h3>
                <p className="text-gray-500">
                  Jadilah yang pertama untuk menyiarkan barang untuk dijual!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Content Modal */}
      {fullContentModal !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {
                  marketplaceItems.find((item) => item.id === fullContentModal)
                    ?.title
                }
              </h3>
              <button
                onClick={closeFullContentModal}
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 prose max-w-none">
              <QuillContentRenderer
                content={
                  marketplaceItems.find((item) => item.id === fullContentModal)
                    ?.content || ""
                }
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeFullContentModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Chat Sidebar - Fixed positioning */}
      <div className="hidden lg:block fixed top-16 right-0 h-[calc(100vh-4rem)] z-30">
        <ChatSidebar />
      </div>

      {/* Fixed Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {/* Scroll to Top Button - Hide on mobile */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="hidden lg:flex bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
            <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Mobile Chat Button */}
        <button
          onClick={() => setIsChatSidebarOpen(true)}
          className="lg:hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 group">
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />

          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            3
          </div>
        </button>
      </div>

      {/* Mobile Chat Sidebar Modal */}
      <div className="lg:hidden">
        <ChatSidebar
          isOpen={isChatSidebarOpen}
          onClose={() => setIsChatSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
