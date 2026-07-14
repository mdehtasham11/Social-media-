import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
import { getMediaUrl } from "../../utils/mediaUrl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export const FriendList = ({ userId }) => {
  const [user, setUser] = useRecoilState(userSelectorState);
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: followers = [], isLoading } = useQuery({
    queryKey: ["friends", id],
    queryFn: () => api(`/api/user/friend/${id}`).then((r) => r.data),
  });

  const unfollowMutation = useMutation({
    mutationFn: (friendId) =>
      api(`/api/user/unfollow/${friendId}`, { method: "POST" }),
    onSuccess: async () => {
      toast.success("Unfollowed");
      queryClient.invalidateQueries({ queryKey: ["friends", id] });
      // Refresh own profile
      try {
        const data = await api(`/api/user/profile/${user._id}`);
        setUser({ user: data.data.user });
      } catch {
        // silently fail
      }
    },
    onError: () => {
      toast.error("Error while unfollowing");
    },
  });

  return (
    <div className="p-4 h-full">
      <h2 className="text-2xl font-bold mb-4">Followers</h2>
      <div className="space-y-4 overflow-y-auto h-full no-scrollbar">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          ))
        ) : (
          followers.map((follower) => (
            <div key={follower.id} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm">
              <img
                src={getMediaUrl(follower.profile, "https://github.com/shadcn.png")}
                alt={follower.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{follower.name}</p>
                <p className="text-gray-500">{follower.username}</p>
              </div>
              {userId === user._id ? (
                <Button
                  onClick={() => unfollowMutation.mutate(follower._id)}
                  disabled={unfollowMutation.isPending}
                >
                  Unfollow
                </Button>
              ) : (
                <></>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendList;
