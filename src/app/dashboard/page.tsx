"use client";
import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/features/chat/ChatSidebar";
import Image from "next/image";
import { Upload, Heart, MessageCircle, User } from "lucide-react";
import { useWebSocket } from "@/lib/hooks/useWs";
import { Announcement } from "@/lib/types";
import dynamic from "next/dynamic";
import { RegisterSpeakerModal } from "@/components/features/kajian/RegisterSpeakerModal";
import { SpeakerSelect } from "@/components/features/kajian/SpeakerSelect";
import { RegisterKitabModal } from "@/components/features/kajian/RegisterKitabModal";
import { KitabSelect } from "@/components/features/kajian/KitabSelect";

// Import MyEditor with no SSR
const MyEditor = dynamic(() => import("@/components/features/form/form"), {
  ssr: false,
});
const RichTextRenderer = dynamic(
  () => import("@/components/features/form/RichTextRenderer"),
  { ssr: false }
);

// Interface untuk form pengumuman baru
interface NewAnnouncementForm {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
  type: "announcement" | "kajian" | "marketplace" | string;
  speaker_name?: string;
  event_date?: string;
  speaker_id?: number | null;
  kitab_id?: number | null;
  kitab_title?: string;
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
    type: "announcement",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isRegisterKitabModalOpen, setIsRegisterKitabModalOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [affiliatedMosqueId, setAffiliatedMosqueId] = useState<number | null>(
    null
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRegisterSpeakerModalOpen, setIsRegisterSpeakerModalOpen] =
    useState(false);
  const [announcementTypeFilter, setAnnouncementTypeFilter] =
    useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizeAnnouncementType = (value?: string | null) =>
    value?.toLowerCase().trim() || "announcement";

  const formatAnnouncementTypeLabel = (value: string) =>
    value
      .split(/[_-]/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Announcement";

  const getTypeBadgeColors = (type: string) => {
    const normalized = normalizeAnnouncementType(type);
    switch (normalized) {
      case "announcement":
        return "bg-blue-100 text-blue-800";
      case "kajian":
        return "bg-purple-100 text-purple-800";
      case "marketplace":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const announcementTypeOptions = useMemo(() => {
    const typeSet = new Set<string>();
    (announcements || []).forEach((announcement) => {
      const type = normalizeAnnouncementType(announcement?.type);
      typeSet.add(type);
    });
    // Ensure all 3 main types are present
    return Array.from(typeSet).sort();
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (announcementTypeFilter === "all") {
      return announcements;
    }
    return announcements.filter(
      (announcement) =>
        normalizeAnnouncementType(announcement?.type) === announcementTypeFilter
    );
  }, [announcements, announcementTypeFilter]);

  const totalLikes = useMemo(
    () =>
      announcements.reduce(
        (sum, announcement) => sum + (announcement?.like_count ?? 0),
        0
      ),
    [announcements]
  );

  const totalComments = useMemo(
    () =>
      announcements.reduce(
        (sum, announcement) => sum + (announcement?.comment_count ?? 0),
        0
      ),
    [announcements]
  );

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
            type: ann.type || "announcement",
            mosqueId: ann.mosque_id,
            author_id: ann.author_id || ann.authorId,
            author_name:
              ann.author_name ||
              ann.userInfo?.username ||
              ann.mosqueInfo?.name ||
              "Unknown",
            like_count: ann.like_count || 0,
            comment_count: ann.comment_count || 0,
            mosqueInfo: {
              id: ann.mosque_id,
              name: ann.mosqueInfo?.name,
              image: ann.mosqueInfo?.image || null,
            },
            userInfo: ann.userInfo
              ? {
                  id: ann.userInfo.id,
                  username: ann.userInfo.username,
                  email: ann.userInfo.email,
                }
              : null,
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

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [announcementTypeFilter]);

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
          type: announcementData.type || "announcement",
          mosqueId: Number(announcementData.mosque_id),
          author_name: announcementData.author_name || "Anonymous",
          like_count: Number(announcementData.like_count || 0),
          comment_count: Number(announcementData.comment_count || 0),
          mosqueInfo: {
            id: Number(announcementData.mosque_id),
            name: announcementData.author_name || "Mosque",
            image: null,
          },
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
      const payload = { ...newAnnouncement };
      if (payload.type === "kajian" && payload.event_date) {
        payload.event_date = new Date(payload.event_date).toISOString();
      }

      const createAnnouncement = await axiosInstance.post(
        "/api/announcement",
        payload,
        {
          withCredentials: true,
        }
      );
      setSuccess(createAnnouncement.data.message);
      setNewAnnouncement({
        title: "",
        content: "",
        url: "",
        type: "announcement",
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
    <div className="min-h-screen relative bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50">
      {/* Islamic Pattern Background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />

      <div className="flex relative text-black">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 lg:pr-80 pb-24">
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

          {/* Create Announcement Form */}
          {isAuthenticated && userRole === "mosque_admin" && (
            <div className="bg-white text-black shadow-xl rounded-2xl mb-6 p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Create New Announcement
                </h2>
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
                {/* Type Selection */}
                <div className="flex space-x-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="announcement"
                      checked={newAnnouncement.type === "announcement"}
                      onChange={handleAnnouncementChange}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="font-medium text-gray-700">
                      Announcement
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="kajian"
                      checked={newAnnouncement.type === "kajian"}
                      onChange={handleAnnouncementChange}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="font-medium text-gray-700">Kuliah</span>
                  </label>
                </div>

                {/* Kajian Specific Fields */}
                {newAnnouncement.type === "kajian" && (
                  <div className="grid grid-cols-1 gap-4 p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Ustadz
                      </label>
                      <SpeakerSelect
                        value={newAnnouncement.speaker_id}
                        onChange={(speakerId, speakerName) => {
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            speaker_id: speakerId,
                            speaker_name: speakerName,
                          }));
                        }}
                        placeholder="Pilih pembicara untuk kuliah..."
                      />
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setIsRegisterSpeakerModalOpen(true)}
                          className="text-sm text-green-600 hover:text-green-700 underline">
                          Ustadz tidak ada? Daftar ustadz baru
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Kitab
                      </label>
                      <KitabSelect
                        value={newAnnouncement.kitab_id}
                        onChange={(kitabId, kitabTitle) => {
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            kitab_id: kitabId,
                            kitab_title: kitabTitle,
                          }));
                        }}
                        placeholder="Pilih kitab untuk kuliah..."
                      />
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setIsRegisterKitabModalOpen(true)}
                          className="text-sm text-green-600 hover:text-green-700 underline">
                          Kitab tidak ada? Daftar kitab baru
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Kuliah
                      </label>
                      <input
                        type="datetime-local"
                        name="event_date"
                        value={newAnnouncement.event_date || ""}
                        onChange={handleAnnouncementChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}

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
                {/* <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Select images for announcement
                </button> */}

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
                          className="text-gray-500 hover:text-gray-700">
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
                            className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer">
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
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Cancel
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

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline md:ml-10">
                  {loading ? "Loading..." : "Create Announcement"}
                </button>
              </form>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Pengumuman</p>
              <p className="text-3xl font-bold text-gray-800">
                {announcements.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-500">Total Likes</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalLikes.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-500">Total Komentar</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalComments.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label
                htmlFor="announcement-type-filter"
                className="text-sm font-medium text-gray-700">
                Filter Tipe Pengumuman:
              </label>
              <select
                id="announcement-type-filter"
                value={announcementTypeFilter}
                onChange={(e) => setAnnouncementTypeFilter(e.target.value)}
                className="flex-1 md:max-w-xs border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="all">Semua Tipe</option>
                {announcementTypeOptions.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {formatAnnouncementTypeLabel(typeOption)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                Menampilkan {filteredAnnouncements.length} dari{" "}
                {announcements.length} pengumuman
              </span>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-6 text-black mt-6">
            {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
              filteredAnnouncements
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((announcement) => {
                  const isMarketplace =
                    normalizeAnnouncementType(announcement.type) ===
                    "marketplace";
                  return (
                    <div
                      key={announcement.id}
                      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12">
                            {isMarketplace ? (
                              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-amber-600" />
                              </div>
                            ) : (
                              <Image
                                src={
                                  announcement.mosqueInfo?.image ||
                                  "/mosque.png"
                                }
                                alt={announcement.mosqueInfo?.name || "Mosque"}
                                className="rounded-full"
                                fill
                              />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {isMarketplace
                                ? announcement.author_name || "User"
                                : announcement.mosqueInfo?.name || "Mosque"}
                            </h3>
                            <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                              {new Date(
                                announcement.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColors(
                            announcement.type ?? "announcement"
                          )}`}>
                          {formatAnnouncementTypeLabel(
                            normalizeAnnouncementType(announcement.type)
                          )}
                        </span>
                        {isMarketplace && (
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                            Your Item
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mt-4">
                        {announcement.title}
                      </h2>
                      <RichTextRenderer
                        content={truncateHtmlContent(announcement.content, 100)}
                      />
                      <div className="flex items-center gap-6 mt-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium">
                            {announcement.like_count || 0} Likes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium">
                            {announcement.comment_count || 0} Komentar
                          </span>
                        </div>
                      </div>
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
                  );
                })
            ) : (
              <div className="bg-white p-8 rounded-2xl text-center shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Announcements Yet
                </h3>
                <p className="text-gray-600">
                  When announcements are posted, they&apos;ll appear here.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredAnnouncements.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}>
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredAnnouncements.length / itemsPerPage)}
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredAnnouncements.length} items)
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredAnnouncements.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredAnnouncements.length / itemsPerPage)
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage ===
                  Math.ceil(filteredAnnouncements.length / itemsPerPage)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}>
                Next
              </button>
            </div>
          )}
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
            className="hidden lg:flex bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
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
          className="lg:hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 group">
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
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

      {/* Register Speaker Modal */}
      <RegisterSpeakerModal
        isOpen={isRegisterSpeakerModalOpen}
        onClose={() => setIsRegisterSpeakerModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh or show success message
          setSuccess("Ustadz berhasil didaftarkan!");
        }}
      />

      {/* Register Kitab Modal */}
      <RegisterKitabModal
        isOpen={isRegisterKitabModalOpen}
        onClose={() => setIsRegisterKitabModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh or show success message
          setSuccess("Kitab berhasil didaftarkan!");
        }}
      />
    </div>
  );
};

export default DashboardPage;
