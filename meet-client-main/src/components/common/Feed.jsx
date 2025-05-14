import { Heart, MessageCircle, Share2, Bookmark, UserPlus, EarthIcon, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { handleDate } from "../../functions/dateFormat";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [like, setLike] = useState(false);

  const handleGetPost = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/feed`,
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
      setPosts(postData.data);
      console.log(postData.data);
      setLoading(true);
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/like/${postId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Already liked");
        return;
      }
      setLike(!like);
    } catch (error) {
      toast.error("Internal server error");
    }
  }
  useEffect(() => {
    handleGetPost();
  }, [like]);

  return (
    <>
      <Toaster position="top-right" duration="4000" />
      {!loading ? (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-xl font-bold mb-4">Feed</h2>
            <Link to="/add"><UserPlus className="block lg:hidden"/></Link>
          </div>
          <div className="h-full overflow-y-auto no-scrollbar">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="mb-10">
                <div className="flex items-center mb-2 space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="w-full h-64 rounded-lg mb-2" />
                <div className="flex items-center mb-2 space-x-4">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-xl font-bold mb-4">Feed</h2>
            <Link to="/add"><UserPlus className="block lg:hidden"/></Link>
          </div>
          {posts.map((post) => (
            <div
              key={post._id}
              className="mb-5 bg-stone-100 px-5 pb-5 pt-1 rounded-lg"
            >
              <div className="flex items-center mb-2 mt-5 pt-1">
                <img
                  src={post.user.profile}
                  alt={post.user.userName}
                  className="w-10 h-10 rounded-full mr-2 object-cover"
                />
                <Link to={`/profile/${post.user._id}`}>
                  <span className="font-bold mr-3">{post.user.userName}</span>
                </Link>
                {post.visibility === 'public' ? <EarthIcon width={18}/> : <Users width={18}/>}
              </div>
              <Link to={`post/${post._id}`}>
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-96 rounded-lg mb-2"
                />
              </Link>
              <div className="flex justify-between items-center mb-5 mt-5">
                <div className="flex items-center">
                  <Heart onClick={()=> handleLike(post._id)} className="mr-2 text-red-500 cursor-pointer" />
                  <span>{post.likeCount}</span>
                  <Link to={`post/${post._id}`}>
                    <MessageCircle className="ml-4 mr-2 cursor-pointer" />
                  </Link>
                  <span>{post.comments.length}</span>
                  <Share2 className="ml-4 mr-2 cursor-pointer" />
                  <Bookmark className="ml-4 cursor-pointer" />
                </div>
              </div>
              <p>
                <span className="font-bold">{post.user.userName} </span>
                {post.caption}
              </p>
              <p className="text-gray-500 mt-2">Posted {" "}{handleDate(post.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-xl font-bold mb-4">Feed</h2>
            <Link to="/add"><UserPlus className="block lg:hidden"/></Link>
          </div>
          <p>No posts to show</p>
        </div>
      )}
    </>
  );
};

export default Feed;
