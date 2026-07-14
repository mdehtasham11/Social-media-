import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import DropDown from "./DropDown";
import { useRecoilState } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
import { getMediaUrl } from "../../utils/mediaUrl";
import { Camera } from "lucide-react";

const ProfileGrid = () => {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [likes, setLikes] = useState(0);
  const { id } = useParams();
  const [userDetail, setUserDetail] = useRecoilState(userSelectorState);

  const handleAllLikes = () => {
    // The backend returns { user, posts } structure
    console.log("handleAllLikes - user object:", user);
    const posts = user?.posts || [];
    console.log("handleAllLikes - posts array:", posts);
    if (Array.isArray(posts)) {
      const sum = posts.reduce((accumulator, item) => {
        return accumulator + (item.likeCount || 0);
      }, 0);
      setLikes(sum);
    } else {
      console.error("User posts are not an array or are undefined");
    }
  };

  const handleGetUser = async () => {
    console.log("Fetching profile for user ID:", id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/profile/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      const userData = await response.json();
      console.log("Profile data received:", userData);
      console.log("User data structure:", userData.data);
      setUser(userData.data);
      setLoading(true);
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
    }
  };

  const handleGetMyProfile = async () => {
    const uId = userDetail._id;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/profile/${uId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      const data = await response.json();
      setUserDetail({ user: data.data.user });
      return true;
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
    }
  };

  const handleAddFriends = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/addFriends`,
        {
          method: "POST",
          body: JSON.stringify({ friendId: userId }),
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        toast.error("Can not add right now");
        return;
      }
      toast.success("Added to friend list");
      await handleGetMyProfile();
      await handleGetUser();
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      setProfileUploading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/profile-picture`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || "Could not update profile picture");
        return;
      }

      const data = await response.json();
      setUser((current) => ({
        ...current,
        user: data.data,
      }));
      setUserDetail({ user: data.data });
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error("Internal server error");
    } finally {
      setProfileUploading(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    handleGetUser();
  }, [id]);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      handleAllLikes();
    }
  }, [user]);
  return (
    <div className="flex-1 h-screen lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
      {!loading ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div>
                <Skeleton className="w-48 h-6 mb-2" />
                <Skeleton className="w-36 h-4" />
              </div>
            </div>
            <Skeleton className="w-24 h-10 rounded" />
          </div>
          <div className="flex justify-between text-center mb-6 border-t border-b py-4">
            <div>
              <Skeleton className="w-20 h-6 mb-1" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div>
              <Skeleton className="w-20 h-6 mb-1" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div>
              <Skeleton className="w-20 h-6 mb-1" />
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="relative group">
                <Skeleton className="w-full h-48 rounded" />
              </div>
            ))}
          </div>
        </>
      ) : (
        user &&
        user.user && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0">
                  <img
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                    src={getMediaUrl(user.user.profile, "https://github.com/shadcn.png")}
                    alt={user.user.userName}
                  />
                  {user.user._id === userDetail?._id && (
                    <label
                      className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-white shadow-md transition hover:bg-zinc-700"
                      title="Change profile picture"
                    >
                      <Camera size={17} />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        disabled={profileUploading}
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold">{user.user.name}</h1>
                  <p className="text-gray-600">{user.user.userName}</p>
                  {user.user._id === userDetail?._id && (
                    <p className="mt-1 text-xs text-gray-500">
                      {profileUploading ? "Uploading..." : "Tap camera to change photo"}
                    </p>
                  )}
                </div>
              </div>
              {user.user._id !== userDetail?._id && (
                <Button onClick={() => handleAddFriends(user.user._id)}>
                  {userDetail?.friendList &&
                  userDetail.friendList.some(
                    (friendId) => friendId === user.user._id
                  )
                    ? "Following"
                    : "Connect"}
                </Button>
              )}
            </div>
            <div className="flex justify-between text-center mb-6 border-t border-b py-4">
              <div>
                <span className="font-semibold text-lg">
                  {(user.posts || []).length}
                </span>
                <p className="text-gray-600">Posts</p>
              </div>
              <div>
                <DropDown
                  friend={(user.user.friendList || []).length}
                  id={user.user._id}
                />
                <p className="text-gray-600">Connection</p>
              </div>
              <div>
                <span className="font-semibold text-lg">{likes}</span>
                <p className="text-gray-600">Likes</p>
              </div>
            </div>
            {(() => {
              console.log("Render - user object:", user);
              console.log("Render - user.posts:", user?.posts);
              console.log("Render - posts length:", (user?.posts || []).length);
              return (user.posts || []).length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {(user.posts || []).map((item) => (
                    <div key={item._id} className="relative group">
                      <Link to={`/post/${item._id}`}>
                        <img
                          className="w-full h-48 object-cover rounded transform group-hover:scale-105 transition duration-300"
                          src={getMediaUrl(item.image)}
                          alt={item._id}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
                  <p className="text-center">No posts to show</p>
                </div>
              );
            })()}
          </>
        )
      )}
    </div>
  );
};

export default ProfileGrid;
