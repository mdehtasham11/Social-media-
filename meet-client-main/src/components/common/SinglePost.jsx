import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EarthIcon, Heart, MessageCircle, Share, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecoilValue } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
// import { handleDate } from "../../functions/dateFormat";

const SinglePost = () => {
  const [post, setPost] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [handleUserAction, setHandleUserAction] = useState(false);
  const user = useRecoilValue(userSelectorState);

  const { id } = useParams();

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/comment/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: newComment }),
        }
      );
      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      toast.success("Comment posted");
      setNewComment("");
      setHandleUserAction(!handleUserAction);
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
    }
  };

  const handleGetPost = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/post/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }
      const postData = await response.json();
      setPost(postData.data);
      console.log(postData.data);
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
    }
  };

  const handleLike = async (postUId) => {
    console.log(postUId);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/like/${postUId}`,
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
      setHandleUserAction(!handleUserAction);
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  useEffect(() => {
    handleGetPost();
  }, [handleUserAction]);

  return (
    <>
      {post && post.caption ? (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center p-4 border-b border-gray-300">
            <Avatar className="w-14 h-14 rounded-full overflow-hidden">
              <AvatarImage
                src={post.profile}
                alt={post._id}
                className="object-cover w-full h-full"
              />
              {post.user && (
                <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
                  {post.user.userName[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {post && (
              <div className="ml-4 mr-3">
                <p className="text-xl font-semibold text-gray-800">
                  {post.userName}
                </p>
              </div>
            )}
            {post.visibility === "public" ? (
              <EarthIcon width={18} />
            ) : (
              <Users width={18} />
            )}
          </div>
          <div className="relative">
            <img
              src={post.image}
              alt="Post"
              className="w-full h-[500px] object-cover rounded-t-xl border-b border-gray-200"
            />
          </div>
          <div className="flex items-center p-4 border-b border-gray-300">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Heart
                  onClick={() => handleLike(id)}
                  className="w-7 h-7 text-red-500"
                />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <MessageCircle className="w-7 h-7 text-gray-700" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Share className="w-7 h-7 text-gray-700" />
              </button>
            </div>
          </div>
          <div className="p-4 ">
            <p className="font-semibold text-lg text-gray-800">
              {post.likeCount} likes
            </p>
            <p className="text-gray-700 mt-2">
              <span className="font-bold text-gray-950">{post.userName}</span>{" "}
              {post.caption}
            </p>
            {/* <p className="text-gray-500 mt-2">
              Posted {handleDate(post.createdAt)}
            </p> */}
            <p className="text-gray-500 mt-2">
              {post.comments.length} comments
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center overflow-hidden border-b border-gray-300 pb-6">
              <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
                  YOU
                </AvatarFallback>
                <AvatarImage
                  src={user.profile}
                  alt={user._id}
                  className="object-cover w-full h-full"
                />
              </Avatar>
              <input
                type="text"
                value={newComment}
                onChange={handleCommentChange}
                className="flex-1 ml-2 px-4 py-2 border-none rounded-lg outline-none placeholder-gray-500"
                placeholder="Add a comment..."
              />
              <button
                onClick={handleCommentSubmit}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Post
              </button>
            </div>
            <div className="space-y-4 pt-6">
              {post &&
                post.commentWithUser.map((comment, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                      <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
                        {comment.user.userName[0].toUpperCase()}
                      </AvatarFallback>
                      <AvatarImage
                        src={comment.user.profile}
                        alt={comment.user._id}
                        className="object-cover w-full h-full"
                      />
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {comment.user.userName}
                      </p>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center p-4 border-b border-gray-300">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="ml-4">
              <Skeleton className="h-10 w-32 lg:w-[96]" />
            </div>
          </div>
          <div className="relative">
            <Skeleton className="h-[500px]" />
          </div>
          <div className="flex items-center p-4 border-b border-gray-300">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-6 w-72" />
          </div>
          <div className="p-4">
            <div className="flex items-center overflow-hidden pb-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-[90%] rounded-lg ml-2" />
              <Skeleton className="ml-2 h-10 w-[10%]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SinglePost;
