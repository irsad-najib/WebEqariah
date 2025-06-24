"use client";
import { useRouter } from "next/navigation";
import Mosque from "./component/mosque";
import Navbar from "./component/navbar";

const Homepage = () => {
  const router = useRouter();

  const handleMosqueClick = (id: number | string) => {
    router.push(`/mosque/${id}`);
  };

  return (
    <>
      <Navbar />
      <Mosque onClick={handleMosqueClick} />
    </>
  );
};

export default Homepage;
