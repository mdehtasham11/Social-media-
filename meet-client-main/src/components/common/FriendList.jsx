import { useEffect, useState } from "react";
import {Button} from "@/components/ui/button"
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton"
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";

export const FriendList = ({userId}) => {
  const [followers, setFollowers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useRecoilState(userSelectorState);
  

  const { id } = useParams();

  const handleGetAllFriends = async () => {
   const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/friend/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      const postData = await response.json();
      setFollowers(postData.data);
      setLoading(false)
    } catch (error) {
      toast.error("Internal server error");
    }
  }

  const handleGetMyProfile = async () => {
   const id = user._id;
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
     const data = await response.json();
     setUser({user: data.data.user});
   } catch (error) {
     toast.error("Internal server error");
     console.log(error);
   }
 }

  const handleUnfollow = async (friendId) => {
   const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/unfollow/${friendId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      toast.success("Unfollowed");
      setLoading(false)
      handleGetAllFriends();
      handleGetMyProfile();
    } catch (error) {
      toast.error("Internal server error");
    }
  }

  useEffect(() => {
    handleGetAllFriends();
  }, [user]);

  return (
   <div className="p-4 h-full">
   <h2 className="text-2xl font-bold mb-4">Followers</h2>
   <div className="space-y-4 overflow-y-auto h-full no-scrollbar">
     {loading ? (
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
             src={follower.profile}
             alt={follower.username}
             className="w-10 h-10 rounded-full"
           />
           <div className="flex-1">
             <p className="font-semibold text-lg">{follower.name}</p>
             <p className="text-gray-500">{follower.username}</p>
           </div>
           {userId === user._id ?<Button onClick={()=> handleUnfollow(follower._id)}>Unfollow</Button>: <></>}
         </div>
       ))
     )}
   </div>
 </div>
  );
};

export default FriendList;
