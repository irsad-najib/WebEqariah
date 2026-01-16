"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/features/chat/ChatSidebar";
import { useAuth } from "@/lib/hooks/useAuth";
import { axiosInstance } from "@/lib/utils/api";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/features/profile/EditProfileModal";
import { EditMosqueModal } from "@/components/features/mosque/EditMosqueModal";
import { Edit, User as UserIcon } from "lucide-react";

interface MosqueData {
  id: number;
  mosque_name: string;
  contact_person: string;
  contact_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  image_url?: string;
  status: string;
}

interface ProfileData {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    affiliated_mosque_id?: number;
    avatar_url?: string;
  };
  mosque?: MosqueData;
}

const Settings = ({
  userData,
  onEdit,
}: {
  userData: ProfileData | null;
  onEdit: () => void;
}) => {
  if (!userData) {
    return (
      <div className="bg-gray-200 text-black">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <p className="text-lg text-green-700 mt-4">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 text-black p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tetapan Profil</h1>
        <Button
          onClick={onEdit}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-md">
          <Edit size={18} />
          Edit Profil
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {userData.user.avatar_url && (
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={userData.user.avatar_url}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Username
          </label>
          <p className="text-lg text-gray-900">{userData.user.username}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Email
          </label>
          <p className="text-lg text-gray-900">{userData.user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Role
          </label>
          <p className="text-lg text-gray-900 capitalize">
            {userData.user.role.replace("_", " ")}
          </p>
        </div>

        {/* <div className="pt-4 border-t">
          <Button
            onClick={onEdit}
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
            <Edit size={18} />
            Edit Profile
          </Button>
        </div> */}
      </div>
    </div>
  );
};

const MosqueSettings = ({
  mosqueData,
  onEdit,
}: {
  mosqueData: MosqueData | null;
  onEdit: () => void;
}) => {
  if (!mosqueData) {
    return null;
  }

  return (
    <div className="bg-gray-200 text-black p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tetapan Masjid</h1>
        <Button
          onClick={onEdit}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-md">
          <Edit size={18} />
          Tetapan Masjid
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {mosqueData.image_url && (
          <div className="flex justify-center mb-4">
            <Image
              src={mosqueData.image_url}
              width={200}
              height={200}
              alt={mosqueData.mosque_name}
              className="rounded-lg object-cover"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nama Masjid
          </label>
          <p className="text-lg text-gray-900">{mosqueData.mosque_name}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Contact Person
          </label>
          <p className="text-lg text-gray-900">{mosqueData.contact_person}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Nombor Talifon
          </label>
          <p className="text-lg text-gray-900">{mosqueData.contact_phone}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Alamat
          </label>
          <p className="text-lg text-gray-900">
            {mosqueData.address_line1}
            {mosqueData.address_line2 && `, ${mosqueData.address_line2}`}
          </p>
          <p className="text-lg text-gray-900">
            {mosqueData.city}, {mosqueData.state} {mosqueData.postal_code}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Status
          </label>
          <p
            className={`text-lg font-semibold ${
              mosqueData.status === "APPROVED"
                ? "text-green-600"
                : mosqueData.status === "PENDING"
                ? "text-yellow-600"
                : "text-red-600"
            }`}>
            {mosqueData.status}
          </p>
        </div>

        {/* <div className="pt-4 border-t">
          <Button
            onClick={onEdit}
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
            <Edit size={18} />
            Edit Mosque
          </Button>
        </div> */}
      </div>
    </div>
  );
};

const Profile = () => {
  const [activePage, setActivePage] = useState<string>("Settings");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMosqueModalOpen, setIsMosqueModalOpen] = useState(false);

  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/profile");
        if (response.data.success) {
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleProfileUpdate = (newData: {
    username: string;
    email: string;
    avatar_url?: string;
  }) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          ...newData,
        },
      });
      // Also update global auth state
      updateUser(newData);
    }
  };

  const handleMosqueUpdate = (newData: MosqueData) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        mosque: newData,
      });
    }
  };

  const handlePageChange = () => {
    switch (activePage) {
      case "Mosque":
        return (
          <MosqueSettings
            mosqueData={profileData?.mosque || null}
            onEdit={() => setIsMosqueModalOpen(true)}
          />
        );
      case "Settings":
        return (
          <Settings
            userData={profileData}
            onEdit={() => setIsProfileModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-gray-200 text-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  const isMosqueAdmin = profileData?.user.role === "mosque_admin";

  return (
    <div className="bg-gray-200 text-black">
      <Navbar />
      <div className="flex bg-gray-100 min-h-screen">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-200 border-r flex flex-col items-center py-20 relative">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div
            className="w-40 h-40 rounded-full overflow-hidden border-2 shadow-xl mb-4 bg-white flex items-center justify-center relative group cursor-pointer hover:border-green-500 transition-all"
            // onClick={() => setIsProfileModalOpen(true)}
            // title="Click to edit profile"
          >
            {profileData?.user.avatar_url ? (
              <Image
                src={profileData.user.avatar_url}
                alt="User avatar"
                fill
                className="object-cover"
              />
            ) : (
              <UserIcon size={80} className="text-gray-400" />
            )}
            {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                <Edit size={24} className="text-green-600" />
              </div>
            </div> */}
          </div>
          <h1 className="text-lg mb-2">
            {profileData?.user.username || "User"}
          </h1>
          {/* <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-sm text-green-600 hover:text-green-700 hover:underline mb-6 flex items-center gap-1">
            <Edit size={14} />
            Edit Profile
          </button> */}
          <ul className="mt-4 space-y-3 text-lg items-center justify-center text-center w-full px-4">
            <li
              className={`hover:bg-gray-300 hover:px-20 hover:py-4 cursor-pointer transition-all ${
                activePage === "Settings"
                  ? "border rounded-lg bg-gray-300 px-20 py-4 items-center"
                  : ""
              }`}
              onClick={() => setActivePage("Settings")}>
              Settings
            </li>
            {isMosqueAdmin && profileData?.mosque && (
              <li
                className={`hover:bg-gray-300 hover:px-20 hover:py-4 cursor-pointer transition-all ${
                  activePage === "Mosque"
                    ? "border rounded-lg bg-gray-300 px-20 py-4 items-center"
                    : ""
                }`}
                onClick={() => setActivePage("Mosque")}>
                Masjid
              </li>
            )}
          </ul>
          <div className="absolute top-[5%] right-0 h-[90%] w-[3px] bg-black" />
        </div>
        {/* Main Content */}
        <div className="flex-1 relative">{handlePageChange()}</div>
        {/* Right Sidebar (Chat) */}
        <div className="sticky top-0 h-screen z-30">
          <ChatSidebar />
        </div>
      </div>

      {/* Modals */}
      {profileData && (
        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userData={profileData.user}
          onSuccess={handleProfileUpdate}
        />
      )}

      {profileData?.mosque && (
        <EditMosqueModal
          isOpen={isMosqueModalOpen}
          onClose={() => setIsMosqueModalOpen(false)}
          mosqueData={profileData.mosque}
          onSuccess={handleMosqueUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
