"use client";
import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../component/API";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define interfaces for our data types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  affiliatedMosqueId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  imageUrl: string;
  mosqueId: string;
  mosqueName: string;
  mosque: {
    contactPerson: string;
    contactPhone: string;
  };
}

interface Mosque {
  id: string;
  mosqueName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  adminId: string;
}

// Define props for the Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number, type: string) => void;
  type: string;
}

const fetchData = async (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setLoading(true);
    const response = await axiosInstance.get(url, { withCredentials: true });
    setData(response.data.data);
    setError(null);
  } catch (er) {
    if (er && typeof er === "object" && "response" in er) {
      const errorResponse = er.response as {
        data?: { message?: Record<string, string> };
      };
      const errorMessage = errorResponse?.data?.message
        ? Object.values(errorResponse.data.message).join(", ")
        : "An unexpected error occurred";
      setError(errorMessage);
    } else {
      setError("An unexpected error occurred");
    }
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
      }`}
    >
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
      }`}
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "announcements" | "mosque"
  >("users");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Pagination states
  const [currentUserPage, setCurrentUserPage] = useState<number>(1);
  const [currentAnnouncementPage, setCurrentAnnouncementPage] = useState<
    number
  >(1);
  const [currentMosquePage, setCurrentMosquePage] = useState<number>(1);
  const itemsPerPage: number = 10;

  useEffect(() => {
    const authsession = async () => {
      try {
        const auth = await axiosInstance.get("api/auth/verify", {
          withCredentials: true,
        });
        if (auth.data.user.role === "admin") {
          if (auth.data.Authenticated === true) {
            setIsAuthenticated(true);
            setUserRole(auth.data.user.role);
          } else {
            router.replace("/");
          }
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
      300000
    );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchData(
      "/api/admin/announcements",
      setAnnouncements,
      setError,
      setLoading
    );
    const intervalId = setInterval(
      () =>
        fetchData(
          "/api/admin/announcements",
          setAnnouncements,
          setError,
          setLoading
        ),
      300000
    );
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchData("/api/admin/mosques", setMosques, setError, setLoading);
    const intervalId = setInterval(
      () => fetchData("/api/admin/mosques", setMosques, setError, setLoading),
      300000
    );
    return () => clearInterval(intervalId);
  }, []);

  const handleApproveMosque = async (mosqueId: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/admin/approve-mosque/${mosqueId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setMosques((prevMosques) =>
          prevMosques.map((mosque) =>
            mosque.id === mosqueId ? { ...mosque, status: "APPROVED" } : mosque
          )
        );
        setError(null);
        alert("Mosque approved successfully");
      }
    } catch (err) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        errorResponse?.response?.data?.message || "Failed to approve mosque."
      );
      console.error("Error approving mosque:", err);
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

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMosque = mosques.filter((mosque) =>
    mosque.mosqueName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginate = (pageNumber: number, type: string): void => {
    if (type === "users") setCurrentUserPage(pageNumber);
    if (type === "announcements") setCurrentAnnouncementPage(pageNumber);
    if (type === "mosque") setCurrentMosquePage(pageNumber);
  };

  useEffect(() => {
    setCurrentUserPage(1);
    setCurrentAnnouncementPage(1);
    setCurrentMosquePage(1);
  }, [searchTerm]);

  const openImagePreview = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(imageUrl);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTable = <T extends Record<string, any>>(
    data: T[],
    columns: string[],
    type: string
  ) => {
    const getCellValue = (item: T, col: string) => {
      if (col.includes(".")) {
        const [parent, child] = col.split(".");
        return item[parent] ? item[parent][child] : "";
      }

      // Check if the column is imageUrl and display as an image
      if (col === "imageUrl" && item[col]) {
        return (
          <div className="relative h-16 w-16">
            <Image
              src={item[col]}
              alt="Preview"
              fill
              sizes="64px"
              className="object-cover rounded cursor-pointer"
              onClick={(e) => openImagePreview(item[col], e)}
            />
          </div>
        );
      }

      return item[col];
    };

    return (
      <div className="overflow-x-auto text-gray-500">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === item.id ? null : item.id)
                    }
                  >
                    {columns.map((col) => {
                      const value = getCellValue(item, col);
                      const isLongContent = value && value.length > 50;

                      return (
                        <td
                          key={col}
                          className="px-3 py-2 text-sm text-gray-500"
                          title={isLongContent ? value : ""}
                        >
                          <div className="truncate max-w-xs">{value}</div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {type === "mosque" && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleApproveMosque(item.id)}
                            disabled={item.status === "APPROVED"}
                          >
                            {item.status === "APPROVED"
                              ? "Approved"
                              : "Approve"}
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === item.id && (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-3 py-2 bg-gray-50"
                      >
                        <div className="p-2">
                          {columns.map((col) => {
                            const value = getCellValue(item, col);
                            return value && value.length > 50 ? (
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
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
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
              <p className="text-gray-500">Manage users and announcements</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
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
                  onClick={() => setActiveTab("users")}
                >
                  Users
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "announcements"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("announcements")}
                >
                  Announcements
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "mosque"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("mosque")}
                >
                  Mosque
                </button>
              </div>
            </div>

            {activeTab === "users" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Users (Showing {filteredUsers.length} of {users.length})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredUsers,
                      ["username", "email", "role", "affiliatedMosqueId"],
                      "users"
                    )}
                    {filteredUsers.length > 0 && (
                      <Pagination
                        currentPage={currentUserPage}
                        totalPages={Math.ceil(
                          filteredUsers.length / itemsPerPage
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Announcements (Showing {filteredAnnouncements.length} of{" "}
                    {announcements.length})
                  </h2>
                  {/* <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  <PlusCircle size={16} className="mr-2" />
                  Add Announcement
                </button> */}
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredAnnouncements,
                      [
                        "title",
                        "content",
                        "createdAt",
                        "authorId",
                        "imageUrl",
                        "mosque.contactPerson",
                        "mosque.contactPhone",
                      ],
                      "announcements"
                    )}
                    {filteredAnnouncements.length > 0 && (
                      <Pagination
                        currentPage={currentAnnouncementPage}
                        totalPages={Math.ceil(
                          filteredAnnouncements.length / itemsPerPage
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
                    Mosque (Showing {filteredMosque.length} of {mosques.length})
                  </h2>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {renderTable(
                      filteredMosque,
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
                      "mosque"
                    )}
                    {filteredMosque.length > 0 && (
                      <Pagination
                        currentPage={currentMosquePage}
                        totalPages={Math.ceil(
                          filteredMosque.length / itemsPerPage
                        )}
                        paginate={paginate}
                        type="mosque"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {previewImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="bg-white p-4 rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
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
                  onClick={() => setPreviewImage(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
