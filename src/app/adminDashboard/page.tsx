"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { axiosInstance } from "@/lib/utils/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAxiosError } from "axios";

// Define interfaces for our data types
import type { User, Announcement, Mosque, Speaker, Kitab } from "@/lib/types";
import {
  deleteKitab,
  fetchAllKitabs,
  updateKitabStatus,
} from "@/lib/api/adminKitab";
import { BidangIlmuManagement } from "@/components/features/admin/BidangIlmuManagement";

type ApiErrorResponse = {
  message?: Record<string, string> | string;
  error?: string;
};

function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred",
): string {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as ApiErrorResponse | undefined;
    if (data?.message) {
      if (typeof data.message === "string") {
        return data.message;
      }
      return Object.values(data.message).join(", ");
    }
    if (data?.error) {
      return data.error;
    }
  }
  return fallback;
}
// Define props for the Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number, type: string) => void;
  type: string;
}

const fetchData = async <T,>(
  url: string,
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    setLoading(true);
    const response = await axiosInstance.get<T[]>(url, {
      withCredentials: true,
    });
    const payload = Array.isArray(response.data) ? response.data : [];
    setData(payload);
    setError(null);
  } catch (error) {
    setError(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  paginate,
  type,
}) => (
  <div className="flex items-center justify-center mt-4 space-x-2">
    <button
      onClick={() => paginate(Math.max(1, currentPage - 1), type)}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded-md ${
        currentPage === 1
          ? "bg-gray-200 cursor-not-allowed"
          : "bg-gray-100 hover:bg-gray-200"
      }`}>
      <ChevronLeft size={16} />
    </button>
    <span className="px-3 py-1">
      Page {currentPage} of {totalPages || 1}
    </span>
    <button
      onClick={() => paginate(Math.min(totalPages, currentPage + 1), type)}
      disabled={currentPage === totalPages || totalPages === 0}
      className={`px-3 py-1 rounded-md ${
        currentPage === totalPages || totalPages === 0
          ? "bg-gray-200 cursor-not-allowed"
          : "bg-gray-100 hover:bg-gray-200"
      }`}>
      <ChevronRight size={16} />
    </button>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "announcements" | "mosque" | "speakers" | "kitab" | "bidang_ilmu"
  >("users");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementTypeFilter, setAnnouncementTypeFilter] =
    useState<string>("all");
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [kitabs, setKitabs] = useState<Kitab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    type: "users" | "mosque" | "speakers" | "kitab" | "announcements" | null;
    id: number | null;
    name: string;
  }>({ show: false, type: null, id: null, name: "" });
  const [deleting, setDeleting] = useState<boolean>(false);

  // Pagination states
  const [currentUserPage, setCurrentUserPage] = useState<number>(1);
  const [currentAnnouncementPage, setCurrentAnnouncementPage] =
    useState<number>(1);
  const [currentMosquePage, setCurrentMosquePage] = useState<number>(1);
  const [currentSpeakerPage, setCurrentSpeakerPage] = useState<number>(1);
  const [currentKitabPage, setCurrentKitabPage] = useState<number>(1);
  const itemsPerPage: number = 10;
  const normalizeAnnouncementType = (value?: string | null) =>
    value?.toLowerCase().trim() || "announcement";

  const formatAnnouncementTypeLabel = (value: string) =>
    value
      .split(/[_-]/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Announcement";

  const announcementTypeOptions = useMemo(() => {
    const typeSet = new Set<string>();
    (announcements || []).forEach((announcement) => {
      typeSet.add(normalizeAnnouncementType(announcement?.type));
    });
    return (typeSet.size ? Array.from(typeSet) : ["announcement"]).sort();
  }, [announcements]);

  const totalAnnouncementLikes = useMemo(
    () =>
      (announcements || []).reduce(
        (sum, announcement) => sum + (announcement?.like_count ?? 0),
        0,
      ),
    [announcements],
  );

  const totalAnnouncementComments = useMemo(
    () =>
      (announcements || []).reduce(
        (sum, announcement) => sum + (announcement?.comment_count ?? 0),
        0,
      ),
    [announcements],
  );

  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });

        // Perbaiki logic authentication check
        if (
          auth.data?.Authenticated === true &&
          auth.data?.user?.role === "admin"
        ) {
          setIsAuthenticated(true);
          setUserRole(auth.data.user.role);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error(err);
        router.replace("/");
      }
    };
    authsession();
  }, [router]);

  useEffect(() => {
    fetchData("/api/admin/users", setUsers, setError, setLoading);
    const intervalId = setInterval(
      () => fetchData("/api/admin/users", setUsers, setError, setLoading),
      300000,
    );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchData(
      "/api/admin/announcements",
      setAnnouncements,
      setError,
      setLoading,
    );
    const intervalId = setInterval(
      () =>
        fetchData(
          "/api/admin/announcements",
          setAnnouncements,
          setError,
          setLoading,
        ),
      300000,
    );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchData("/api/admin/mosques", setMosques, setError, setLoading);
    const intervalId = setInterval(
      () => fetchData("/api/admin/mosques", setMosques, setError, setLoading),
      300000,
    );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/speaker/", {
          withCredentials: true,
        });
        // speaker routes return { success, data }
        const list = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setSpeakers(list);
        setError(null);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
    const intervalId = setInterval(fetchSpeakers, 300000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchKitabs = async () => {
      try {
        setLoading(true);
        const list = await fetchAllKitabs();
        setKitabs(list);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load kitabs."));
        setKitabs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKitabs();
    const intervalId = setInterval(fetchKitabs, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const handleApproveMosque = async (mosqueId: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/admin/approve-mosque/${mosqueId}`,
        {},
        { withCredentials: true },
      );

      const statusFromServer = response?.data?.status as string | undefined;
      const fallbackStatus = mosques.find(
        (mosque) => String(mosque.id) === String(mosqueId),
      )?.status;

      const normalizedStatus = statusFromServer
        ? (statusFromServer.toUpperCase() as Mosque["status"])
        : undefined;

      const toggledStatus: Mosque["status"] = normalizedStatus
        ? normalizedStatus
        : fallbackStatus === "APPROVED"
          ? "PENDING"
          : "APPROVED";

      setMosques((prevMosques) =>
        prevMosques.map((mosque) =>
          String(mosque.id) === String(mosqueId)
            ? { ...mosque, status: toggledStatus }
            : mosque,
        ),
      );

      setError(null);

      // Optional: refresh data to stay synced with backend
      await fetchData("/api/admin/mosques", setMosques, setError, setLoading);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to update mosque status."));
      console.error("Error updating mosque status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get("api/auth/logout", {
        withCredentials: true,
      });
      setIsLogin(false);
      router.replace("/");
    } catch (err) {
      console.log(err);
    }
  };

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredUsers = (users || []).filter(
    (user) =>
      (user?.username || "").toLowerCase().includes(normalizedSearchTerm) ||
      (user?.email || "").toLowerCase().includes(normalizedSearchTerm),
  );
  const filteredAnnouncements = (announcements || []).filter((announcement) => {
    const matchesSearch =
      (announcement?.title || "")
        .toLowerCase()
        .includes(normalizedSearchTerm) ||
      (announcement?.content || "")
        .toLowerCase()
        .includes(normalizedSearchTerm);

    const matchesType =
      announcementTypeFilter === "all" ||
      normalizeAnnouncementType(announcement?.type) === announcementTypeFilter;

    return matchesSearch && matchesType;
  });
  const filteredMosque = (mosques || []).filter((mosque) =>
    (mosque?.mosqueName || "").toLowerCase().includes(normalizedSearchTerm),
  );
  const filteredSpeakers = (speakers || []).filter(
    (speaker) =>
      (speaker?.name || "").toLowerCase().includes(normalizedSearchTerm) ||
      (speaker?.expertise || "").toLowerCase().includes(normalizedSearchTerm),
  );
  const filteredKitabs = (kitabs || []).filter((kitab) => {
    const judul = (kitab?.judul || "").toLowerCase();
    const pengarang = (kitab?.pengarang || "").toLowerCase();
    const bidang = (kitab?.bidang_ilmu || "").toLowerCase();
    return (
      judul.includes(normalizedSearchTerm) ||
      pengarang.includes(normalizedSearchTerm) ||
      bidang.includes(normalizedSearchTerm)
    );
  });

  const paginate = (pageNumber: number, type: string): void => {
    if (type === "users") setCurrentUserPage(pageNumber);
    if (type === "announcements") setCurrentAnnouncementPage(pageNumber);
    if (type === "mosque") setCurrentMosquePage(pageNumber);
    if (type === "speakers") setCurrentSpeakerPage(pageNumber);
    if (type === "kitab") setCurrentKitabPage(pageNumber);
  };

  useEffect(() => {
    setCurrentUserPage(1);
    setCurrentAnnouncementPage(1);
    setCurrentMosquePage(1);
    setCurrentSpeakerPage(1);
    setCurrentKitabPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentAnnouncementPage(1);
  }, [announcementTypeFilter]);

  const openImagePreview = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };

  const handleDeleteClick = (
    type: "users" | "mosque" | "speakers" | "kitab" | "announcements",
    id: number | string,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setDeleteConfirmation({ show: true, type, id: Number(id), name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return;

    setDeleting(true);
    try {
      if (deleteConfirmation.type === "kitab") {
        await deleteKitab(deleteConfirmation.id);
        setKitabs(kitabs.filter((kitab) => kitab.id !== deleteConfirmation.id));
      } else if (deleteConfirmation.type === "users") {
        await axiosInstance.delete(`api/admin/users/${deleteConfirmation.id}`, {
          withCredentials: true,
        });
        setUsers(
          users.filter((user) => Number(user.id) !== deleteConfirmation.id),
        );
      } else if (deleteConfirmation.type === "mosque") {
        await axiosInstance.delete(
          `api/admin/mosques/${deleteConfirmation.id}`,
          { withCredentials: true },
        );
        setMosques(
          mosques.filter((mosque) => mosque.id !== deleteConfirmation.id),
        );
      } else if (deleteConfirmation.type === "speakers") {
        await axiosInstance.delete(`api/speaker/${deleteConfirmation.id}`, {
          withCredentials: true,
        });
        setSpeakers(
          speakers.filter((speaker) => speaker.id !== deleteConfirmation.id),
        );
      } else if (deleteConfirmation.type === "announcements") {
        await axiosInstance.delete(
          `/api/announcement/${deleteConfirmation.id}`,
          { withCredentials: true },
        );
        setAnnouncements(
          announcements.filter((ann) => ann.id !== deleteConfirmation.id),
        );
      }
      setDeleteConfirmation({ show: false, type: null, id: null, name: "" });
      setError(null);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to delete. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, type: null, id: null, name: "" });
  };

  const handleUpdateSpeakerStatus = async (
    speakerId: number,
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await axiosInstance.put(
        `/api/speaker/${speakerId}/status`,
        { status },
        { withCredentials: true },
      );

      if (response.data.success) {
        // Update local state
        setSpeakers((prevSpeakers) =>
          prevSpeakers.map((speaker) =>
            speaker.id === speakerId ? { ...speaker, status } : speaker,
          ),
        );
        setError(null);
      }
    } catch (error) {
      setError(getErrorMessage(error, "Failed to update speaker status."));
      console.error("Error updating speaker status:", error);
    }
  };

  const handleUpdateKitabStatus = async (
    kitabId: number,
    status: "approved" | "rejected",
  ) => {
    try {
      await updateKitabStatus(kitabId, status);
      setKitabs((prev) =>
        prev.map((k) => (k.id === kitabId ? { ...k, status } : k)),
      );
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update kitab status."));
      console.error("Error updating kitab status:", err);
    }
  };

  const renderTable = <T extends object>(
    data: T[],
    columns: string[],
    type: string,
  ) => {
    // Safety check untuk data
    const safeData = data || [];

    const getCellValue = (item: T, col: string): React.ReactNode => {
      const record = item as Record<string, unknown>;
      if (col.includes(".")) {
        const [parent, child] = col.split(".");
        const parentValue = record[parent];
        if (
          parentValue &&
          typeof parentValue === "object" &&
          parentValue !== null
        ) {
          const nested = parentValue as Record<string, unknown>;
          return nested[child] !== undefined && nested[child] !== null
            ? String(nested[child])
            : "";
        }
        return "";
      }

      // Check if the column is imageUrl and display as an image
      const value = record[col];
      if (col === "imageUrl" && typeof value === "string" && value) {
        return (
          <div className="relative h-16 w-16">
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="64px"
              className="object-cover rounded cursor-pointer"
              onClick={(e) => openImagePreview(value, e)}
            />
          </div>
        );
      }

      if (col === "type" && typeof value === "string") {
        return formatAnnouncementTypeLabel(normalizeAnnouncementType(value));
      }

      if (value === null || typeof value === "undefined") {
        return "";
      }

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }

      return value as React.ReactNode;
    };

    return (
      <div className="overflow-x-auto text-gray-500">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {safeData.length > 0 ? (
              safeData.map((item) => (
                <React.Fragment
                  key={String(
                    (item as Record<string, unknown>)?.id ?? Math.random(),
                  )}>
                  <tr
                    key={String(
                      (item as Record<string, unknown>)?.id ?? Math.random(),
                    )}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedRow(
                        expandedRow ===
                          String((item as Record<string, unknown>)?.id ?? "")
                          ? null
                          : String((item as Record<string, unknown>)?.id ?? ""),
                      )
                    }>
                    {columns.map((col) => {
                      const value = getCellValue(item, col);
                      const isLongContent =
                        value && typeof value === "string" && value.length > 50;

                      return (
                        <td
                          key={col}
                          className="px-3 py-2 text-sm text-gray-500"
                          title={isLongContent ? value : ""}>
                          <div className="truncate max-w-xs">{value}</div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {type === "mosque" && (
                          <button
                            className={`$${
                              (item as Record<string, unknown>)?.status ===
                              "APPROVED"
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveMosque(
                                String(
                                  (item as Record<string, unknown>)?.id ?? "",
                                ),
                              );
                            }}>
                            {(item as Record<string, unknown>)?.status ===
                            "APPROVED"
                              ? "Unapprove"
                              : "Approve"}
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => e.stopPropagation()}>
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={(e) =>
                            handleDeleteClick(
                              type as "users" | "mosque" | "announcements",
                              ((item as Record<string, unknown>)?.id as
                                | string
                                | number) ?? "",
                              type === "users"
                                ? String(
                                    (item as Record<string, unknown>)?.username,
                                  )
                                : type === "announcements"
                                  ? String(
                                      (item as Record<string, unknown>)?.title,
                                    )
                                  : String(
                                      (item as Record<string, unknown>)
                                        ?.mosqueName,
                                    ),
                              e,
                            )
                          }>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow ===
                    String((item as Record<string, unknown>)?.id ?? "") && (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-3 py-2 bg-gray-50">
                        <div className="p-2">
                          {columns.map((col) => {
                            const value = getCellValue(item, col);
                            return value &&
                              typeof value === "string" &&
                              value.length > 50 ? (
                              <div key={col} className="mb-2">
                                <span className="font-medium">{col}: </span>
                                <span className="whitespace-pre-wrap">
                                  {value}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm
                    ? `No ${type} match your search criteria`
                    : `No ${type} found`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="bg-gray-100 min-h-screen p-6 text-gray-500">
      {isAuthenticated && isLogin === true && userRole === "admin" && (
        <div className="max-w-6xl mx-auto">
          <header className="bg-white p-6 rounded-lg shadow mb-6 flex justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-gray-500">Urus pengguna dan pengumuman</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </header>

          <div className="bg-white p-4 rounded-lg shadow mb-6 flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500 mb-1">
                Total Likes di Semua Pengumuman
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {totalAnnouncementLikes.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500 mb-1">
                Total Komentar di Semua Pengumuman
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {totalAnnouncementComments.toLocaleString()}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "users"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("users")}>
                  Users
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "announcements"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("announcements")}>
                  Announcements
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "mosque"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("mosque")}>
                  Mosque
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "speakers"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("speakers")}>
                  Speakers
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "kitab"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("kitab")}>
                  Kitab
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "bidang_ilmu"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("bidang_ilmu")}>
                  Bidang Ilmu
                </button>
              </div>
            </div>

            {activeTab === "users" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Users (Showing {filteredUsers?.length || 0} of{" "}
                    {users?.length || 0})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredUsers || [],
                      ["username", "email", "role", "affiliatedMosqueId"],
                      "users",
                    )}
                    {(filteredUsers?.length || 0) > 0 && (
                      <Pagination
                        currentPage={currentUserPage}
                        totalPages={Math.ceil(
                          (filteredUsers?.length || 0) / itemsPerPage,
                        )}
                        paginate={paginate}
                        type="users"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <h2 className="text-lg font-medium">
                    Announcements (Showing {filteredAnnouncements?.length || 0}{" "}
                    of {announcements?.length || 0})
                  </h2>
                  <div className="flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:items-center">
                    <label
                      htmlFor="announcement-type-filter"
                      className="font-medium">
                      Filter tipe pengumuman
                    </label>
                    <select
                      id="announcement-type-filter"
                      value={announcementTypeFilter}
                      onChange={(e) =>
                        setAnnouncementTypeFilter(e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">Semua tipe</option>
                      {announcementTypeOptions.map((typeOption) => (
                        <option key={typeOption} value={typeOption}>
                          {formatAnnouncementTypeLabel(typeOption)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredAnnouncements || [],
                      [
                        "title",
                        "content",
                        "type",
                        "like_count",
                        "comment_count",
                        "createdAt",
                        "authorId",
                        "imageUrl",
                        "mosque.contactPerson",
                        "mosque.contactPhone",
                      ],
                      "announcements",
                    )}
                    {(filteredAnnouncements?.length || 0) > 0 && (
                      <Pagination
                        currentPage={currentAnnouncementPage}
                        totalPages={Math.ceil(
                          (filteredAnnouncements?.length || 0) / itemsPerPage,
                        )}
                        paginate={paginate}
                        type="announcements"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "mosque" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Mosque (Showing {filteredMosque?.length || 0} of{" "}
                    {mosques?.length || 0})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredMosque || [],
                      [
                        "mosqueName",
                        "addressLine1",
                        "addressLine2",
                        "city",
                        "state",
                        "postalCode",
                        "contactPerson",
                        "contactPhone",
                        "status",
                        "imageUrl",
                        "createdAt",
                        "adminId",
                      ],
                      "mosque",
                    )}
                    {(filteredMosque?.length || 0) > 0 && (
                      <Pagination
                        currentPage={currentMosquePage}
                        totalPages={Math.ceil(
                          (filteredMosque?.length || 0) / itemsPerPage,
                        )}
                        paginate={paginate}
                        type="mosque"
                      />
                    )}
                  </>
                )}{" "}
              </div>
            )}

            {activeTab === "speakers" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Speakers (Showing {filteredSpeakers?.length || 0} of{" "}
                    {speakers?.length || 0})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Expertise
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSpeakers
                            .slice(
                              (currentSpeakerPage - 1) * itemsPerPage,
                              currentSpeakerPage * itemsPerPage,
                            )
                            .map((speaker) => (
                              <tr key={speaker.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {speaker.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {speaker.photo_url ? (
                                      <Image
                                        src={speaker.photo_url}
                                        alt={speaker.name}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-full mr-3"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <span className="text-green-600 font-medium">
                                          {speaker.name.charAt(0)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-sm font-medium text-gray-900">
                                      {speaker.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {speaker.expertise || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      speaker.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : speaker.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {speaker.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    speaker.created_at,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2">
                                    {speaker.status === "pending" && (
                                      <button
                                        onClick={() =>
                                          handleUpdateSpeakerStatus(
                                            speaker.id,
                                            "approved",
                                          )
                                        }
                                        className="text-green-600 hover:text-green-900">
                                        Approve
                                      </button>
                                    )}
                                    {speaker.status === "pending" && (
                                      <button
                                        onClick={() =>
                                          handleUpdateSpeakerStatus(
                                            speaker.id,
                                            "rejected",
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900">
                                        Reject
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) =>
                                        handleDeleteClick(
                                          "speakers",
                                          speaker.id,
                                          speaker.name,
                                          e,
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {(filteredSpeakers?.length || 0) > 0 && (
                      <Pagination
                        currentPage={currentSpeakerPage}
                        totalPages={Math.ceil(
                          (filteredSpeakers?.length || 0) / itemsPerPage,
                        )}
                        paginate={paginate}
                        type="speakers"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "kitab" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Kitab (Showing {filteredKitabs?.length || 0} of{" "}
                    {kitabs?.length || 0})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nama Kitab
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori / Bidang Ilmu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredKitabs
                            .slice(
                              (currentKitabPage - 1) * itemsPerPage,
                              currentKitabPage * itemsPerPage,
                            )
                            .map((kitab) => (
                              <tr key={kitab.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {kitab.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {kitab.judul}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {kitab.pengarang || "-"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {kitab.bidang_ilmu || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      kitab.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : kitab.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {kitab.status || "pending"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {kitab.created_at
                                    ? new Date(
                                        kitab.created_at,
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2">
                                    {kitab.status === "pending" && (
                                      <button
                                        onClick={() =>
                                          handleUpdateKitabStatus(
                                            kitab.id,
                                            "approved",
                                          )
                                        }
                                        className="text-green-600 hover:text-green-900">
                                        Approve
                                      </button>
                                    )}
                                    {kitab.status === "pending" && (
                                      <button
                                        onClick={() =>
                                          handleUpdateKitabStatus(
                                            kitab.id,
                                            "rejected",
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900">
                                        Reject
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) =>
                                        handleDeleteClick(
                                          "kitab",
                                          kitab.id,
                                          kitab.judul,
                                          e,
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900"
                                      title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {(filteredKitabs?.length || 0) > 0 && (
                      <Pagination
                        currentPage={currentKitabPage}
                        totalPages={Math.ceil(
                          (filteredKitabs?.length || 0) / itemsPerPage,
                        )}
                        paginate={paginate}
                        type="kitab"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Bidang Ilmu Tab */}
            {activeTab === "bidang_ilmu" && (
              <div className="p-6">
                <BidangIlmuManagement />
              </div>
            )}
          </div>
          {previewImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}>
              <div
                className="bg-white p-4 rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <div className="relative w-96 h-96 md:w-[500px] md:h-[700px]">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
                  onClick={() => setPreviewImage(null)}>
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmation.show && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleDeleteCancel}>
              <div
                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-gray-700">
                        {deleteConfirmation.name}
                      </span>
                      ?
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                      <p className="text-sm text-yellow-700">
                        <strong>Warning:</strong> This action cannot be undone.
                        All related data will be permanently deleted.
                      </p>
                    </div>
                    {deleteConfirmation.type === "mosque" && (
                      <div className="text-sm text-gray-600 mb-2">
                        <p className="font-medium mb-1">
                          This will also delete:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>All announcements from this mosque</li>
                          <li>All likes on those announcements</li>
                          <li>All comments on those announcements</li>
                          <li>Update affiliated users</li>
                        </ul>
                      </div>
                    )}
                    {deleteConfirmation.type === "announcements" && (
                      <div className="text-sm text-gray-600 mb-2">
                        <p className="font-medium mb-1">
                          This will also delete:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>All likes on this announcement</li>
                          <li>All comments on this announcement</li>
                        </ul>
                      </div>
                    )}
                    {deleteConfirmation.type === "users" && (
                      <div className="text-sm text-gray-600 mb-2">
                        <p className="font-medium mb-1">
                          This will also delete:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>All announcements by this user</li>
                          <li>All likes by this user</li>
                          <li>All comments by this user</li>
                          <li>All messages sent/received</li>
                          <li>All mosques owned by this user</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
                    {deleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
