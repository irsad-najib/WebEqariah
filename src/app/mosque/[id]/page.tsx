"use client";
import { axiosInstance } from "@/lib/utils/api";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/features/chat/ChatSidebar";
import { useWebSocket } from "@/lib/hooks/useWs";
import { useToast, ToastContainer } from "@/components/ui/toast";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const QuillContentRenderer = dynamic(
  () => import("@/components/features/form/QuillContentRenderer"),
  { ssr: false }
);

/**
 * Type definitions for the mosque page
 */
import {
  Mosque,
  Announcement,
  WebSocketMessage,
  WebSocketAnnouncementData,
  Comment,
} from "@/lib/types";

/**
 * Format a date string to localized format
 * @param dateString - ISO date string to format
 * @returns Formatted date string in Indonesian locale
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Fetches a mosque by its ID
 * @param id - The mosque ID to fetch
 * @returns Promise containing the mosque data or null
 */
async function getMosqueById(id: string): Promise<Mosque | null> {
  if (!id) {
    console.error("Mosque ID is required");
    return null;
  }

  try {
    const response = await axiosInstance.get(`/api/mosque/${id}`, {
      withCredentials: true,
    });
    if (!response.data || !response.data.data) {
      console.error("Mosque not found");
      return null;
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching mosque:", error);
    return null;
  }
}

/**
 * Sort announcements by latest ID (descending order)
 */
const sortAnnouncementsByLatestId = (
  announcements: Announcement[]
): Announcement[] => {
  return [...announcements].sort((a, b) => Number(b.id) - Number(a.id));
};

/**
 * Main mosque page component
 */
export default function MosquePage() {
  // Extract mosque ID from params
  const parameter = useParams();
  const mosqueId = parameter.id as string;

  // Toast notifications
  const { toasts, closeToast, warning, error: showError } = useToast();

  // State definitions
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [commentInput, setCommentInput] = useState("");
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false); // ✅ Add mobile chat sidebar state
  const [showScrollTop, setShowScrollTop] = useState(false); // ✅ Add scroll to top state

  const router = useRouter();

  // WebSocket connection
  const { connectionStatus, lastMessage } = useWebSocket(
    "wss://api.eqariah.com/api/ws",
    mosqueId
  );

  /**
   * Check if user is logged in
   */
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        setIsLogin(auth.data.Authenticated === true);
      } catch {
        setIsLogin(false);
      }
    };
    checkLoginStatus();
  }, []);

  // ✅ Add scroll listener untuk scroll to top button
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

  const truncateHtmlContent = (content: string, maxLength: number) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const textContent = tempDiv.textContent || tempDiv.innerText;

    if (textContent.length <= maxLength) {
      return content; // Return original content if it's short enough
    }

    // Return shortened version for display
    return content.substring(0, maxLength) + "...";
  };

  /**
   * Fetch mosque data and its announcements
   */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);

        // Validate ID
        if (!mosqueId) {
          setError(true);
          return;
        }

        // Fetch mosque data
        const mosqueData = await getMosqueById(mosqueId);
        if (!mosqueData) {
          setError(true);
          return;
        }
        setMosque(mosqueData);

        // Fetch announcements
        try {
          const response = await axiosInstance.get(
            `/api/announcement/mosque/${mosqueId}`,
            { withCredentials: true }
          );

          // Map response to consistent announcement objects
          if (response.data && Array.isArray(response.data)) {
            setAnnouncements(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              response.data.map((a: any) => ({
                id: a.id,
                title: a.title,
                content: a.content,
                createdAt: a.createdAt || a.created_at,
                url: a.mediaUrl || a.media_url,
                mosqueId: a.mosqueId || a.mosque_id,
                like_count: a.likeCount ?? a.like_count ?? 0,
                comment_count: a.commentCount ?? a.comment_count ?? 0,
                liked_by_user: a.likedByUser ?? a.liked_by_user ?? false,
                type: a.type || "announcement",
                speaker_name: a.speaker_name ?? a.speakerName ?? null,
                speakerName: a.speakerName ?? a.speaker_name ?? null,
                event_date: a.event_date ?? a.eventDate ?? null,
                eventDate: a.event_date ?? a.eventDate ?? null,
                author: a.author_name ? { username: a.author_name } : undefined,
                mosque: mosqueData, // Attach the freshly fetched mosque data
              })) as Announcement[]
            );
          }
        } catch (announcementError) {
          console.error("Failed to fetch announcements:", announcementError);
          setAnnouncements([]);
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mosqueId]);

  /**
   * Fetch comments for announcements
   */
  useEffect(() => {
    announcements.forEach((a) => {
      if (comments[a.id] === undefined) {
        fetchComments(a.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements]);

  /**
   * Handle WebSocket messages (unified handler)
   */
  useEffect(() => {
    if (!lastMessage) return;

    console.log("WebSocket message received:", lastMessage);

    // Extract the message data and type
    let messageData: WebSocketAnnouncementData | null = null;
    let messageType: string | null = null;
    const wsMessage = lastMessage as WebSocketMessage;

    // Determine message type and structure
    if (wsMessage.type === "new_announcement" && wsMessage.data) {
      messageData = wsMessage.data;
      messageType = wsMessage.type;
    } else if (wsMessage.id && wsMessage.title) {
      messageData = wsMessage as WebSocketAnnouncementData;
      messageType = "new_announcement";
    } else if (wsMessage.type === "like_update" && wsMessage.content) {
      // Handle like updates
      const content = wsMessage.content;
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === content.announcement_id
            ? {
                ...a,
                like_count: content.like_count,
                liked_by_user:
                  content.user_id === "current_user" ? true : a.liked_by_user,
              }
            : a
        )
      );
    } else if (wsMessage.type === "new_comment" && wsMessage.content) {
      // Handle new comments
      const content = wsMessage.content;

      // Update announcement comment count
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === content.announcement_id
            ? {
                ...a,
                comment_count:
                  content.comment_count || (a.comment_count || 0) + 1,
              }
            : a
        )
      );

      // Add new comment to state if available and not from current user
      if (content.comment && content.comment.user_id !== "current_user") {
        setComments((prev) => ({
          ...prev,
          [content.announcement_id]: [
            ...(prev[content.announcement_id] || []),
            {
              id: content.comment.id,
              content: content.comment.content,
              user_id: content.comment.user_id,
              username: content.comment.username || "User",
              created_at:
                content.comment.created_at || new Date().toISOString(),
            },
          ],
        }));
      }
    }

    // Handle new announcements
    if (messageType === "new_announcement" && messageData && mosque) {
      const announcementId =
        typeof messageData.id === "string"
          ? parseInt(messageData.id, 10)
          : messageData.id;

      const newAnnouncement: Announcement = {
        id: announcementId,
        title: messageData.title,
        content: messageData.content,
        url: messageData.media_url ?? undefined,
        mosqueId: Number(messageData.mosque_id),
        createdAt: messageData.created_at,
        type: messageData.type || "announcement",
        speaker_name:
          messageData.speaker_name ?? messageData.speakerName ?? null,
        speakerName:
          messageData.speakerName ?? messageData.speaker_name ?? null,
        event_date: messageData.event_date ?? messageData.eventDate ?? null,
        eventDate: messageData.event_date ?? messageData.eventDate ?? null,
        mosque: mosque, // Add the mosque object from state
      };

      // Add new announcement if it doesn't already exist
      setAnnouncements((prev) => {
        const exists = prev.some((ann) => ann.id === newAnnouncement.id);
        if (exists) return prev;
        return sortAnnouncementsByLatestId([newAnnouncement, ...prev]);
      });
    }
  }, [lastMessage, mosque]);

  /**
   * Handle like action for an announcement
   */
  const handleLike = async (announcementId: number | string) => {
    if (!isLogin) {
      // Show nicer notification in production code instead of alert
      alert("Silakan login untuk menyukai pengumuman.");
      router.push("/login");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/api/announcement/${announcementId}/like`,
        {},
        { withCredentials: true }
      );

      // Update local state with new like count
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? {
                ...a,
                like_count: res.data.like_count,
                liked_by_user: true,
              }
            : a
        )
      );
    } catch (err) {
      console.error("Failed to like announcement:", err);
      alert("Gagal menyukai pengumuman. Silakan coba lagi.");
    }
  };

  /**
   * Handle comment submission
   */
  const handleComment = async (
    announcementId: number | string,
    content: string,
    resetInput: () => void
  ) => {
    if (!isLogin) {
      alert("Silakan login untuk berkomentar.");
      router.push("/login");
      return;
    }

    if (!content.trim()) return;

    try {
      await axiosInstance.post(
        `/api/announcement/${announcementId}/comments`,
        { content },
        { withCredentials: true }
      );

      // Update local announcement comment count
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? { ...a, comment_count: (a.comment_count || 0) + 1 }
            : a
        )
      );

      resetInput();
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Gagal menambah komentar. Silakan coba lagi.");
    }
  };

  /**
   * Fetch comments for a specific announcement
   */
  const fetchComments = async (announcementId: number | string) => {
    setLoadingComments((prev) => ({ ...prev, [announcementId]: true }));

    try {
      const res = await axiosInstance.get(
        `/api/announcement/${announcementId}/comments`,
        {
          withCredentials: true,
        }
      );

      setComments((prev) => ({
        ...prev,
        [announcementId]: res.data,
      }));
    } catch (err) {
      console.error(
        `Failed to fetch comments for announcement ${announcementId}:`,
        err
      );
      setComments((prev) => ({
        ...prev,
        [announcementId]: [],
      }));
    } finally {
      setLoadingComments((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600 text-lg">Loading mosque...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render error state
  if (error || !mosque) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Masjid Tidak Ditemukan
              </h1>
              <p className="text-gray-600 mb-6">
                Maaf, masjid yang Anda cari tidak dapat ditemukan.
              </p>
              <Link href="/mosque">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                  Kembali ke Daftar Masjid
                </button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main content
  return (
    <>
      <Navbar />
      <div className="flex bg-gray-100 min-h-screen relative">
        {/* Main Content */}
        <div className="flex-1 px-4 py-8 lg:pr-80 pb-24">
          {/* WebSocket Status Indicator */}
          <div className="max-w-5xl mx-auto mb-4">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                connectionStatus ? "bg-green-500" : "bg-red-500"
              }`}></span>
            <span className="text-sm text-gray-600">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Mosque Header */}
          <div className="max-w-5xl mx-auto bg-[#232526] rounded-lg shadow-md mb-8 relative overflow-hidden">
            <div className="h-24 md:h-32 w-full bg-white" />
            <div className="absolute left-8 top-8 flex items-end gap-4">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#232526] overflow-hidden bg-white flex items-center justify-center">
                  {mosque.imageUrl ? (
                    <Image
                      src={mosque.imageUrl}
                      alt={mosque.mosqueName}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              <div className="pb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {mosque.mosqueName}
                </h1>
              </div>
            </div>
            {/* Back Button */}
            <div className="absolute right-8 top-8">
              <Link href="/">
                <button className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white font-bold py-2 px-4 rounded transition-colors">
                  Kembali
                </button>
              </Link>
            </div>
            <div className="h-32" />
          </div>

          {/* Main Content Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
            {/* Announcements Section */}
            <section className="md:col-span-2">
              <div>
                <h2 className="text-2xl font-bold mb-4">Announcement</h2>
                {announcements && announcements.length > 0 ? (
                  <div className="grid gap-4">
                    {announcements.map((announcement) => {
                      const isKajian = announcement.type === "kajian";
                      const eventDateRaw =
                        announcement.event_date || announcement.eventDate;
                      const eventDateObject = eventDateRaw
                        ? new Date(eventDateRaw)
                        : null;
                      const hasValidEventDate =
                        eventDateObject !== null &&
                        !Number.isNaN(eventDateObject.getTime());
                      const eventDateLabel = hasValidEventDate
                        ? eventDateObject.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : null;
                      const eventTimeLabel = hasValidEventDate
                        ? eventDateObject.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : null;
                      const statusLabel =
                        isKajian && hasValidEventDate
                          ? eventDateObject!.getTime() < Date.now()
                            ? "Sedang / Baru Selesai"
                            : "Akan Datang"
                          : null;
                      const contentToRender = isKajian
                        ? announcement.content
                        : truncateHtmlContent(announcement.content, 100);
                      const showSpeaker = Boolean(announcement.speaker_name);
                      const showEventDetails = hasValidEventDate;

                      return (
                        <div
                          key={announcement.id}
                          className={`rounded-xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                            isKajian
                              ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"
                              : "border-gray-200 bg-white"
                          }`}>
                          {/* Kajian Header Banner */}
                          {isKajian && (
                            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                    <svg
                                      className="w-5 h-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-white font-bold text-sm uppercase tracking-wider">
                                      Kajian Islam
                                    </span>
                                    {statusLabel && (
                                      <span className="block text-emerald-100 text-xs mt-0.5">
                                        {statusLabel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-white/90 text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {formatDate(announcement.createdAt)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Announcement Content Container */}
                          <div className="p-5">
                            {/* Regular Announcement Header (non-kajian) */}
                            {!isKajian && (
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-gray-800 flex-1">
                                  {announcement.title}
                                </h3>
                                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                                  {formatDate(announcement.createdAt)}
                                </span>
                              </div>
                            )}

                            {/* Kajian Title */}
                            {isKajian && (
                              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                {announcement.title}
                              </h3>
                            )}

                            {/* Kajian Event Details Card */}
                            {isKajian &&
                              (showSpeaker ||
                                showEventDetails ||
                                announcement.bidang_ilmu) && (
                                <div className="mb-4 bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {showSpeaker && (
                                      <div className="flex items-start gap-3">
                                        <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                                          <svg
                                            className="w-4 h-4 text-emerald-700"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <span className="block text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">
                                            Pemateri
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            {announcement.speaker_name}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {announcement.bidang_ilmu && (
                                      <div className="flex items-start gap-3">
                                        <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                                          <svg
                                            className="w-4 h-4 text-emerald-700"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <span className="block text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">
                                            Bidang Ilmu
                                          </span>
                                          <span className="text-gray-900 font-medium">
                                            {announcement.bidang_ilmu}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {showEventDetails && (
                                      <>
                                        <div className="flex items-start gap-3">
                                          <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                                            <svg
                                              className="w-4 h-4 text-emerald-700"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                              />
                                            </svg>
                                          </div>
                                          <div>
                                            <span className="block text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">
                                              Tanggal
                                            </span>
                                            <span className="text-gray-900 font-medium">
                                              {eventDateLabel}
                                            </span>
                                          </div>
                                        </div>
                                        {eventTimeLabel && (
                                          <div className="flex items-start gap-3">
                                            <div className="bg-emerald-100 rounded-full p-2 mt-0.5">
                                              <svg
                                                className="w-4 h-4 text-emerald-700"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                            </div>
                                            <div>
                                              <span className="block text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">
                                                Waktu
                                              </span>
                                              <span className="text-gray-900 font-medium">
                                                {eventTimeLabel} WIB
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Announcement Content */}
                            <div className={isKajian ? "text-gray-700" : ""}>
                              <QuillContentRenderer content={contentToRender} />
                            </div>

                            {/* Announcement Image */}
                            {announcement.url && (
                              <div className="mt-4 rounded-lg overflow-hidden">
                                <Image
                                  src={announcement.url}
                                  alt={announcement.title}
                                  width={600}
                                  height={400}
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                            )}

                            {/* Author info */}
                            {announcement.author && (
                              <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>
                                  Oleh:{" "}
                                  <span className="font-medium">
                                    {announcement.author.username}
                                  </span>
                                </span>
                              </p>
                            )}

                            {/* Like and Comment Section */}
                            <div
                              className={`flex border-t mt-4 pt-3 ${
                                isKajian
                                  ? "border-emerald-200"
                                  : "border-gray-300"
                              }`}>
                              {/* Like Button */}
                              <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2 font-semibold focus:outline-none transition-colors ${
                                  announcement.liked_by_user
                                    ? "text-blue-600"
                                    : isKajian
                                    ? "text-emerald-700 hover:text-emerald-800"
                                    : "text-gray-600 hover:text-blue-600"
                                }`}
                                onClick={() => handleLike(announcement.id)}
                                disabled={!isLogin}>
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 9V5a3 3 0 00-6 0v4M5 15h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
                                  />
                                </svg>
                                Like ({announcement.like_count || 0})
                              </button>

                              {/* Comment Button */}
                              <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2 font-semibold focus:outline-none transition-colors ${
                                  isKajian
                                    ? "text-emerald-700 hover:text-emerald-800"
                                    : "text-gray-600 hover:text-blue-600"
                                }`}
                                onClick={() => {
                                  document
                                    .getElementById(
                                      `comment-input-${announcement.id}`
                                    )
                                    ?.focus();
                                }}>
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m5-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2z"
                                  />
                                </svg>
                                Comment ({announcement.comment_count || 0})
                              </button>
                            </div>

                            {/* Comments Section */}
                            <div
                              className={`mt-4 border-t pt-3 ${
                                isKajian
                                  ? "border-emerald-100"
                                  : "border-gray-200"
                              }`}>
                              {/* Comment Counter */}
                              <div className="flex items-center mb-3">
                                <svg
                                  className="w-5 h-5 text-gray-500 mr-2"
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
                                <span className="text-gray-600 font-medium">
                                  {announcement.comment_count || 0} Komentar
                                </span>
                              </div>

                              {/* Comment Input */}
                              <div className="flex gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                  <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                    {isLogin ? "U" : "?"}
                                  </div>
                                </div>

                                <form
                                  className="flex-1"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!isLogin) {
                                      alert("Silakan login untuk berkomentar.");
                                      router.push("/login");
                                      return;
                                    }
                                    handleComment(
                                      announcement.id,
                                      commentInput,
                                      () => setCommentInput("")
                                    );
                                  }}>
                                  <div className="flex bg-gray-100 rounded-full overflow-hidden">
                                    <input
                                      id={`comment-input-${announcement.id}`}
                                      type="text"
                                      className="flex-1 bg-transparent border-none px-4 py-2 focus:outline-none text-sm"
                                      placeholder={
                                        isLogin
                                          ? "Tulis komentar..."
                                          : "Login untuk berkomentar"
                                      }
                                      value={commentInput}
                                      onChange={(e) =>
                                        setCommentInput(e.target.value)
                                      }
                                      disabled={!isLogin}
                                      onClick={() => {
                                        if (!isLogin) {
                                          alert(
                                            "Silakan login untuk berkomentar."
                                          );
                                          router.push("/login");
                                        }
                                      }}
                                    />
                                    <button
                                      type="submit"
                                      className={`px-4 py-2 text-sm font-medium ${
                                        !isLogin || !commentInput.trim()
                                          ? "text-gray-400 cursor-not-allowed"
                                          : "text-blue-600 hover:text-blue-700"
                                      }`}
                                      disabled={
                                        !isLogin || !commentInput.trim()
                                      }>
                                      Kirim
                                    </button>
                                  </div>
                                </form>
                              </div>

                              {/* Comments Loading State */}
                              {loadingComments[announcement.id] && (
                                <div className="flex items-center justify-center py-3 text-black">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                                  <span className="ml-2 text-sm text-gray-500">
                                    Memuat komentar...
                                  </span>
                                </div>
                              )}

                              {/* Comments List */}
                              {!loadingComments[announcement.id] &&
                                comments[announcement.id] &&
                                (comments[announcement.id].length > 0 ? (
                                  <div className="space-y-3">
                                    {comments[announcement.id].map(
                                      (comment) => (
                                        <div
                                          key={comment.id}
                                          className="flex gap-2">
                                          {/* Avatar */}
                                          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                              {comment.username
                                                .charAt(0)
                                                .toUpperCase()}
                                            </div>
                                          </div>

                                          <div>
                                            {/* Comment Bubble */}
                                            <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-md">
                                              <div className="font-semibold text-sm">
                                                {comment.username}
                                              </div>
                                              <p className="text-gray-700 text-sm">
                                                {comment.content}
                                              </p>
                                            </div>
                                            {/* Timestamp */}
                                            <div className="text-xs text-gray-500 mt-1 ml-2">
                                              {formatDate(comment.created_at)}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    Belum ada komentar. Jadilah yang pertama
                                    berkomentar!
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Tidak ada pengumuman saat ini.
                  </p>
                )}
              </div>
            </section>

            {/* Mosque Details Section */}
            <aside className="md:col-span-1 text-black">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Details</h2>

                {/* Address Information */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Alamat</h3>
                  <p className="text-gray-700">{mosque.addressLine1}</p>
                  {mosque.addressLine2 && (
                    <p className="text-gray-700">{mosque.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {mosque.city}, {mosque.state} {mosque.postalCode}
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Kontak</h3>
                  <p className="text-gray-700">
                    <strong>Penanggung Jawab:</strong> {mosque.contactPerson}
                  </p>
                  <p className="text-gray-700">
                    <strong>Telepon:</strong> {mosque.contactPhone}
                  </p>
                </div>

                {/* Registration Date */}
                <div className="mt-6">
                  <p className="text-gray-500 text-sm mt-2">
                    Terdaftar sejak: {formatDate(mosque.createdAt)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Desktop Chat Sidebar - Fixed positioning */}
        <div className="hidden lg:block fixed top-16 right-0 h-[calc(100vh-4rem)] z-30">
          <ChatSidebar />
        </div>
      </div>

      {/* ✅ Fixed Floating Buttons Container - Same as dashboard */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {/* Scroll to Top Button - Hide on mobile */}
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

      {/* ✅ Mobile Chat Sidebar Modal */}
      <div className="lg:hidden">
        <ChatSidebar
          isOpen={isChatSidebarOpen}
          onClose={() => setIsChatSidebarOpen(false)}
        />
      </div>
    </>
  );
}
