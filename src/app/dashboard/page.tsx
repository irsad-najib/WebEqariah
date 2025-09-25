"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/features/chat/ChatSidebar";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useWebSocket } from "@/lib/hooks/useWs";
import { Announcement } from "@/lib/types";
import dynamic from "next/dynamic";

// Import MyEditor with no SSR
const MyEditor = dynamic(() => import("@/components/features/form/form"), {
  ssr: false,
});

// Interface untuk form pengumuman baru
interface NewAnnouncementForm {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncementForm>({
    title: "",
    content: "",
    url: "",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [affiliatedMosqueId, setAffiliatedMosqueId] = useState<number | null>(
    null
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        if (auth.data.Authenticated === true) {
          setIsAuthenticated(true);
          setUserRole(auth.data.user.role);
          setAffiliatedMosqueId(auth.data.user.affiliated_mosque_id);
          if (auth.data.user.role === "admin") {
            router.replace("/adminDashboard");
          } else {
            fetchAnnouncements();
          }
        } else {
          router.replace("/");
        }
      } catch (errr) {
        console.log(errr);
        router.replace("/");
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const response = await axiosInstance.get(`/api/announcement`, {
          withCredentials: true,
        });
        const transformedAnnouncements =
          response.data?.map((ann: Announcement) => ({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            url: ann.media_url || null,
            mosqueId: ann.mosque_id,
            mosque: {
              id: ann.mosque_id,
              name: ann.mosqueInfo?.name,
              image: ann.mosqueInfo?.image || null,
            },
            createdAt: ann.createdAt,
          })) || [];
        setAnnouncements(sortAnnouncementsByLatestId(transformedAnnouncements));
      } catch (error) {
        console.log("error fetching announcements", error);
      }
    };

    authsession();
  }, [router]);

  // Scroll listener untuk scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { connectionStatus, lastMessage } = useWebSocket(
    "wss://api.eqariah.com/api/ws",
    affiliatedMosqueId ? String(affiliatedMosqueId) : undefined
  );

  useEffect(() => {
    if (lastMessage) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any =
          typeof lastMessage === "string"
            ? JSON.parse(lastMessage)
            : lastMessage;

        const announcementData = payload.data;

        const newAnn: Announcement = {
          id: Number(announcementData.id),
          title: announcementData.title,
          content: announcementData.content,
          url: announcementData.media_url || null,
          mosqueId: Number(announcementData.mosque_id),
          author_name: announcementData.author_name || "Anonymous",
          like_count: Number(announcementData.like_count || 0),
          comment_count: Number(announcementData.comment_count || 0),
          mosque: {
            id: Number(announcementData.mosque_id),
            mosqueName: announcementData.author_name || "Mosque",
            url: null,
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            contactPerson: "",
            contactPhone: "",
            status: "APPROVED",
            createdAt: "",
            adminId: "",
          },
          createdAt: announcementData.created_at,
        };

        setAnnouncements((prev) => {
          const exists = prev.some((i) => i.id === newAnn.id);
          if (exists) {
            return prev;
          }
          return sortAnnouncementsByLatestId([newAnn, ...prev]);
        });

        setSuccess("New announcement received!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("❌ Error processing WebSocket message:", error);
        console.error("❌ Raw message that failed:", lastMessage);
      }
    }
  }, [lastMessage, connectionStatus]);

  const handleAnnouncementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewAnnouncement({
      ...newAnnouncement,
      [e.target.name]: e.target.value,
    });
  };

  const truncateHtmlContent = (content: string, maxLength: number) => {
    // Always check if we're on client side for DOM operations
    if (typeof window === "undefined") {
      // Server-side fallback
      const stripped = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
      if (stripped.length <= maxLength) {
        return content;
      }
      return stripped.substring(0, maxLength) + "...";
    }

    // Client-side DOM parsing
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const textContent = tempDiv.textContent || tempDiv.innerText;

    if (textContent.length <= maxLength) {
      return content;
    }

    return content.substring(0, maxLength) + "...";
  };

  // New handler for editor content changes
  const handleEditorChange = (content: string) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      content,
    }));
  };

  // Handler for media uploads from editor
  const handleMediaUpload = (mediaUrl: string) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      mediaUrl,
    }));
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createAnnouncement = await axiosInstance.post(
        "/api/announcement",
        newAnnouncement,
        {
          withCredentials: true,
        }
      );
      setSuccess(createAnnouncement.data.message);
      setNewAnnouncement({
        title: "",
        content: "",
        url: "",
      });
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError({
        general: "Failed to create announcement: " + (err as Error).message,
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
        "/api/mosque/upload-image",
        formDataImage,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setNewAnnouncement((prev) => ({
          ...prev,
          imageUrl: response.data.url,
        }));
        setError((prev) => ({ ...prev, imageUrl: "" }));
        setIsOpen(false);
        setPreview(null);
        setFile(null);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error uploading image";
      setError((prev) => ({
        ...prev,
        imageUrl: errorMessage,
      }));
    } finally {
      setUploading(false);
    }
  };

  const sortAnnouncementsByLatestId = (announcements: Announcement[]) => {
    return [...announcements].sort((a, b) => b.id - a.id);
  };

  return (
    <div className="bg-gray-200 min-h-screen relative">
      <Navbar />

      <div className="flex relative">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 lg:pr-80 pb-24">
          {/* WebSocket Status Indicator */}
          <div className="mb-4 flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                connectionStatus ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm text-gray-600">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Create Announcement Form */}
          {isAuthenticated && userRole === "mosque_admin" && (
            <div className="bg-white text-black shadow-md rounded-lg mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Announcement</h2>
              </div>

              {error && Object.keys(error).length > 0 && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {Object.values(error).map((errMsg, index) => (
                    <p key={index}>{errMsg}</p>
                  ))}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="title"
                    value={newAnnouncement.title}
                    onChange={handleAnnouncementChange}
                    placeholder="Title"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2">
                  <MyEditor
                    value={newAnnouncement.content}
                    onEditorChange={handleEditorChange}
                    onMediaUpload={handleMediaUpload}
                    uploadEndpoint="/api/upload-media"
                    showSendButton={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Select images for announcement
                </button>

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
                          Upload image for announcement(Optional)
                        </h3>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Select and preview your image before uploading
                      </p>
                      <p className="text-sm text-gray-500">
                        Maks size image 5 mb
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        format file: png, jpg, jpeg, heic, and heif
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            id="mosque-image-modal"
                          />
                          <label
                            htmlFor="mosque-image-modal"
                            className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer"
                          >
                            <Upload className="h-6 w-6 mb-2" />
                            Choose Image
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
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                              >
                                {uploading ? "Uploading..." : "Upload"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline md:ml-10"
                >
                  {loading ? "Loading..." : "Create Announcement"}
                </button>
              </form>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-6 text-black mt-6">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={announcement.mosqueInfo?.image || "/mosque.png"}
                          alt={announcement.mosqueInfo?.name || "Mosque"}
                          className="rounded-full"
                          fill
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {announcement.mosqueInfo?.name || "Mosque"}
                        </h3>
                        <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                          {new Date(
                            announcement.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mt-4">
                    {announcement.title}
                  </h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: truncateHtmlContent(announcement.content, 100),
                    }}
                  />
                  {announcement.url && (
                    <div className="mt-4 inline-block">
                      <Image
                        src={announcement.url}
                        alt={announcement.title}
                        className="rounded-lg object-contain"
                        width={400}
                        height={384}
                        style={{ maxHeight: "24rem", width: "auto" }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg text-center shadow-md">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Announcements Yet
                </h3>
                <p className="text-gray-500">
                  When announcements are posted, they&apos;ll appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Chat Sidebar - Fixed positioning */}
        <div className="hidden lg:block fixed top-16 right-0 h-[calc(100vh-4rem)] z-30">
          <ChatSidebar />
        </div>
      </div>

      {/* Fixed Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {/* Scroll to Top Button - Hide on mobile or adjust position */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="hidden lg:flex bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}

        {/* Mobile Chat Button */}
        <button
          onClick={() => setIsChatSidebarOpen(true)}
          className="lg:hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 group"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
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
};

export default DashboardPage;
