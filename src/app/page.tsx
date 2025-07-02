"use client";
import { useRouter } from "next/navigation";
import Mosque from "./component/mosque";
import Navbar from "./component/navbar";
import Sidebar from "./component/sidebar";
import Footer from "./component/footer";
import ChatSidebar from "./component/chatSidebar";

const Homepage = () => {
  const router = useRouter();

  const handleMosqueClick = (id: number | string) => {
    router.push(`/mosque/${id}`);
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar />
      <div className="flex min-h-screen">
        <div className="sticky top-0 h-screen z-30"><Sidebar /></div>
        <div className="flex-1">
          <Mosque onClick={handleMosqueClick} />
        </div>
        <div className="sticky top-0 h-screen z-30"><ChatSidebar /></div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
