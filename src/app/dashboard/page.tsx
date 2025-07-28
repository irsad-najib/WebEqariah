"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/utils/api";
import { Navbar } from "@/app/components/layout/Navbar";
import { Sidebar } from "@/app/components/layout/Sidebar";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useWebSocket } from "@/lib/hooks/useWs";

interface Mosque {
  id: number;
  mosqueName: string;
  url: string | null;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  url: string | null;
  mosqueId: number;
  mosque: Mosque;
  createdAt: string;
  media_url?: string | null;
  author_name?: string | null;
  mosque_id?: number;
  created_at?: string;
}

// Tipe untuk pesan WebSocket
interface WebSocketMessage {
  type?: string;
  data?: WebSocketAnnouncementData;
  id?: number | string;
  title?: string;
  content?: string;
  media_url?: string | null;
  mosque_id?: number | string;
  author_name?: string;
  created_at?: string;
}

// Tipe untuk data pengumuman dari WebSocket
interface WebSocketAnnouncementData {
  id: number | string;
  title: string;
  content: string;
  media_url?: string | null;
  mosque_id: number | string;
  author_name?: string;
  created_at: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
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
  const [affiliatedMosqueId, setAffiliatedMosqueId] = useState<number | null>(
    null
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
          console.log("Authenticated user:", auth.data.user);
          setAffiliatedMosqueId(auth.data.user.affiliated_mosque_id); // <-- ambil dari user
          if (auth.data.user.role === "admin") {
            router.replace("/adminDashboard");
          } else {
            // Fetch announcements immediately after authentication succeeds
            fetchAnnouncements();
          }
          console.log("p");
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
        console.log("Announcements response:", response.data);
        const transformedAnnouncements =
          response.data?.map((ann: Announcement) => ({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            url: ann.media_url || null,
            mosqueId: ann.mosque_id,
            mosque: {
              id: ann.mosque_id,
              mosqueName: "Mosque",
              url: null,
            },
            createdAt: ann.created_at,
          })) || [];
        setAnnouncements(sortAnnouncementsByLatestId(transformedAnnouncements));
      } catch (error) {
        console.log("error fetching announcements", error);
      }
    };

    authsession();
    // Remove the interval for fetching announcements since we'll use WebSocket
    // const intervalId = setInterval(fetchAnnouncements, 300000);
    // return () => clearInterval(intervalId);
  }, [router]);

  const { connectionStatus, lastMessage } = useWebSocket(
    "ws://localhost:5000/api/ws",
    affiliatedMosqueId ? String(affiliatedMosqueId) : undefined
  );
  // Listen for WebSocket messages
  useEffect(() => {
    console.log("=== Dashboard WebSocket useEffect ===");
    console.log("lastMessage:", lastMessage);
    console.log("connectionStatus:", connectionStatus);

    if (lastMessage) {
      console.log("Raw lastMessage:", JSON.stringify(lastMessage, null, 2));

      // Handle different message structures
      let messageData: WebSocketAnnouncementData | null = null;
      let messageType: string | null = null;

      // Lakukan type assertion untuk memberitahu TypeScript tentang struktur data
      const wsMessage = lastMessage as WebSocketMessage;

      // Check if it's the expected structure
      if (wsMessage.type === "new_announcement" && wsMessage.data) {
        messageData = wsMessage.data;
        messageType = wsMessage.type;
      }
      // Or if the whole message is the announcement data
      else if (wsMessage.id && wsMessage.title) {
        messageData = wsMessage as WebSocketAnnouncementData;
        messageType = "new_announcement";
      }

      if (messageType === "new_announcement" && messageData) {
        console.log("Processing announcement data:", messageData);

        // Convert ID to number if it's a string
        const announcementId =
          typeof messageData.id === "string"
            ? parseInt(messageData.id, 10)
            : messageData.id;

        // Create the new announcement with guaranteed number ID
        const newAnn: Announcement = {
          id: Number(announcementId),
          title: messageData.title,
          content: messageData.content,
          url: messageData.media_url || null,
          mosqueId: Number(messageData.mosque_id),
          mosque: {
            id: Number(messageData.mosque_id),
            mosqueName: messageData.author_name || "Mosque",
            url: null,
          },
          createdAt: messageData.created_at,
        };

        console.log(
          "Transformed announcement with ID type:",
          typeof newAnn.id,
          newAnn
        );

        // Add debugging to state update
        setAnnouncements((prev) => {
          // Log existing IDs to check type
          console.log(
            "Current announcement IDs:",
            prev.map((a) => ({ id: a.id, type: typeof a.id }))
          );

          const exists = prev.some((ann) => ann.id === newAnn.id);
          if (exists) {
            console.log(
              "Announcement already exists, skipping. ID:",
              newAnn.id
            );
            return prev;
          }
          console.log("Adding new announcement to list. ID:", newAnn.id);
          // Make sure we're keeping them sorted
          return sortAnnouncementsByLatestId([newAnn, ...prev]);
        });

        setSuccess("New announcement received!");
        setTimeout(() => setSuccess(""), 3000);
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

      console.log("Create announcement response:", createAnnouncement.data);
      setSuccess(createAnnouncement.data.message);
      setNewAnnouncement({
        title: "",
        content: "",
        url: "",
      });

      // No need to manually refresh announcements
      // WebSocket will broadcast the new announcement to all clients
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
        // Set the image URL to the newAnnouncement state
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

  // Add this function near your other state management functions
  const sortAnnouncementsByLatestId = (announcements: Announcement[]) => {
    return [...announcements].sort((a, b) => b.id - a.id);
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 container mx-auto px-4">
          {/* WebSocket Status Indicator */}
          <div className="mb-4">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                connectionStatus ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm text-gray-600">
              {connectionStatus ? "Connected" : "Disconnected"}
            </span>
          </div>

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
                <div>
                  <textarea
                    name="content"
                    value={newAnnouncement.content}
                    onChange={handleAnnouncementChange}
                    placeholder="Content"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Select images for announcement
                </button>

                {isOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
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

                      <p className="text-sm text-gray-500 ">
                        Select and preview your image before uploading
                      </p>
                      <p className="text-sm text-gray-500 ">
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

          <div className="space-y-6 text-black mt-6">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={announcement.mosque?.url || "/mosque.png"}
                          alt={announcement.mosque?.mosqueName || "Mosque"}
                          className="rounded-full"
                          fill
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {announcement.mosque?.mosqueName || "Mosque"}
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
                  <p className="text-gray-500 mt-2 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
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
              <div className="bg-white p-6 rounded-lg text-center">
                No announcements available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
