import React, { useState } from "react";
import Navbar from "./Navbar";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "../ui/badge";
import AppliedJob from "./AppliedJob";
import EditProfileModal from "./EditProfileModal";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";

 
const isResume = true;
const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  
  // Debug user data structure
  console.log("=== PROFILE DEBUG ===");
  console.log("User data:", user);
  console.log("User profile:", user?.profile);
  console.log("Profile photo (nested):", user?.profile?.profilePhoto);
  console.log("Profile photo (direct):", user?.profilePhoto);
  
  // Debug profile photo URL construction
  const profilePhoto = user?.profile?.profilePhoto || user?.profilePhoto;
  console.log("Selected profile photo:", profilePhoto);
  
  if (profilePhoto && profilePhoto.trim() !== "") {
    const constructedUrl = profilePhoto.startsWith('http') 
      ? profilePhoto 
      : `https://dreamhire-backend-ljay.onrender.com${profilePhoto}`;
    console.log("Constructed URL:", constructedUrl);
    console.log("URL starts with http:", profilePhoto.startsWith('http'));
    console.log("Final URL will be:", constructedUrl);
  } else {
    console.log("No profile photo found, using placeholder");
  }
  console.log("===================");
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-4xl mx-auto  bg-white border border-gray-200 rounded-2xl my-5 p-8 shadow shadow-gray-400 hover:shadow-yellow-400">
        <div className="flex justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="cursor-pointer h-24 w-24">
              <AvatarImage
                src={
                  (() => {
                    const profilePhoto = user?.profile?.profilePhoto || user?.profilePhoto;
                    if (profilePhoto && profilePhoto.trim() !== "") {
                      const finalUrl = profilePhoto.startsWith('http') 
                        ? profilePhoto 
                        : `https://dreamhire-backend-ljay.onrender.com${profilePhoto}`;
                      console.log("AvatarImage src set to:", finalUrl);
                      return finalUrl;
                    }
                    console.log("AvatarImage src set to placeholder");
                    return "https://via.placeholder.com/150";
                  })()
                }
                alt="@shadcn"
                onLoad={(e) => {
                  console.log("AvatarImage loaded successfully:", e.target.src);
                }}
                onError={(e) => {
                  console.log("AvatarImage load error, original src:", e.target.src);
                  console.log("Setting to placeholder");
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </Avatar>
            <div>
              <h1 className=" font-medium text-xl">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              console.log("Edit button clicked");
              console.log("Current open state:", open);
              setOpen(true);
              console.log("After setOpen, open state should be true");
            }}
            className="text-right"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span className="">
              <a href={`mailto:${user?.email}`}>{user?.email}</a>
            </span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span className="">
              <a href={`tel:${user?.phoneNumber}`}>{user?.phoneNumber}</a>
            </span>
          </div>
        </div>

        <div>
          <div className="my-5">
            <h1>Skills</h1>
            <div className="flex items-center gap-1">
              {user?.profile?.skills.length !== 0 ? (
                user?.profile?.skills.map((item, index) => (
                  <Badge key={index}>{item}</Badge>
                ))
              ) : (
                <span>NA</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label className="text-md font-bold"> Resume</label>
            <div>
              {isResume ? (
                <a
                  target="_blank"
                  href={user?.profile?.resume}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Download
                  {user?.profile?.resumeOriginalname || 'Resume'}
                </a>
              ) : (
                <span>No Resume Found</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="text-lg my-5 font-bold">Applied Jobs</h1>

        {/* Add Application Table */}
        <AppliedJob />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
