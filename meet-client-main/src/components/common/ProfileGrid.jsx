import { useMemo } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import DropDown from "./DropDown";
import { useRecoilState } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
import { getMediaUrl } from "../../utils/mediaUrl";
import { Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useState } from "react";

const ProfileGrid = () => {
  const [profileUploading, setProfileUploading] = useState(false);
  const { id } = useParams();
  const [userDetail, setUserDetail] = useRecoilState(userSelectorState);
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => api(`/api/user/profile/${id}`).then((r) => r.data),
  });

  const user = profileData || {};
  const likes = useMemo(() => {
    const posts = user?.posts || [];
    if (!Array.isArray(posts)) return 0;
    return posts.reduce((acc, item) => acc + (item.likeCount || 0), 0);
  }, [user]);

  const addFriendMutation = useMutation({
    mutationFn: (userId) =>
      api("/api/user/addFriends", {
        method: "POST",
        body: JSON.stringify({ friendId: userId }),
      }),
    onSuccess: async () => {
      toast.success("Added to friend list");
      // Refresh both profile and own profile
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      // Refresh own profile for friendList check
      try {
        const myData = await api(`/api/user/profile/${userDetail._id}`);
        setUserDetail({ user: myData.data.user });
      } catch {
        // silently fail
      }
    },
    onError: () => {
      toast.error("Can not add right now");
    },
  });

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      setProfileUploading(true);
      const data = await api("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      });

      // Update cache and recoil state
      queryClient.setQueryData(["profile", id], (old) =>
        old ? { ...old, user: data.data } : old
      );
      setUserDetail({ user: data.data });
      toast.success("Profile picture updated");
    } catch {
      toast.error("Could not update profile picture");
    } finally {
      setProfileUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex-1 h-screen lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
      {isLoading ? (
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
                <Button
                  onClick={() => addFriendMutation.mutate(user.user._id)}
                  disabled={addFriendMutation.isPending}
                >
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
            {(user.posts || []).length > 0 ? (
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
            )}
          </>
        )
      )}
    </div>
  );
};

export default ProfileGrid;
