// testing untuk menampilkan video di website
import React from "react";
import MyEditor from "@/components/features/form/form";

const VideoPage = () => {
  return (
    <div>
      <h1>Video Page</h1>
      <video width="1000" controls autoPlay muted>
        <source
          src="/test/(625) Flashmob HiVi - PORSTAT IPB 2021 - YouTube - Google Chrome 2024-07-08 19-44-05.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <MyEditor />
    </div>
  );
};

export default VideoPage;
