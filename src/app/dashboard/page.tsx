"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../component/API";
import Image from "next/image";
import { Upload } from "lucide-react";
import Navbar from "../component/navbar";

interface Mosque {
  id: number;
  mosqueName: string;
  imageUrl: string | null;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  mosqueId: number;
  mosque: Mosque;
  createdAt: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        if (auth.data.Authenticated === true) {
          setIsAuthenticated(true);
          setUserRole(auth.data.user.role);
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
        const response = await axiosInstance.get("/api/announcement", {
          withCredentials: true,
        });
        setAnnouncements(response.data.data);
      } catch (error) {
        console.log("error fetching announcements", error);
      }
    };

    authsession();
    const intervalId = setInterval(fetchAnnouncements, 300000);

    return () => clearInterval(intervalId);
  }, [router]);

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
        imageUrl: "",
      });

      // Refresh announcements after creating a new one
      const response = await axiosInstance.get("/api/announcement", {
        withCredentials: true,
      });
      setAnnouncements(response.data.data);
    } catch (er) {
      if (er && typeof er === "object" && "response" in er) {
        const errorResponse = er.response as {
          data?: { message?: Record<string, string> };
        };
        setError(
          errorResponse?.data?.message || { general: "An error occurred" }
        );
      } else {
        setError({ general: "An unexpected error occurred" });
      }
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
          imageUrl: response.data.data.imageUrl,
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
  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4">
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
                        src={announcement.mosque?.imageUrl || "/mosque.png"}
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
                        {new Date(announcement.createdAt).toLocaleDateString()}
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
                {announcement.imageUrl && (
                  <div className="mt-4 inline-block">
                    <Image
                      src={announcement.imageUrl}
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
              <p>No announcements available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
