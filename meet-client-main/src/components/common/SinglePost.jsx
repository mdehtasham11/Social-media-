import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EarthIcon, Heart, MessageCircle, Share, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecoilValue } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
import { getMediaUrl } from "../../utils/mediaUrl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

const SinglePost = () => {
  const [newComment, setNewComment] = useState("");
  const user = useRecoilValue(userSelectorState);
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: ["post", id],
    queryFn: () => api(`/api/user/post/${id}`).then((r) => r.data),
  });

  const likeMutation = useMutation({
    mutationFn: (postId) =>
      api(`/api/user/like/${postId}`, { method: "GET" }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previous = queryClient.getQueryData(["post", id]);
      queryClient.setQueryData(["post", id], (old) =>
        old ? { ...old, likeCount: old.likeCount + 1 } : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["post", id], context?.previous);
      toast.error("Already liked");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (comment) =>
      api(`/api/user/comment/${id}`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      }),
    onSuccess: () => {
      toast.success("Comment posted");
      setNewComment("");
      // Refetch to get the new comment with user data
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
    onError: () => {
      toast.error("Error posting comment");
    },
  });

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  return (
    <>
      {post && post.caption ? (
        <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
          <div className="flex items-center p-4 border-b border-gray-300">
            <Avatar className="w-14 h-14 rounded-full overflow-hidden">
              <AvatarImage
                src={getMediaUrl(post.profile)}
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
              src={getMediaUrl(post.image)}
              alt="Post"
              className="w-full h-[500px] object-cover rounded-t-xl border-b border-gray-200"
            />
          </div>
          <div className="flex items-center p-4 border-b border-gray-300">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Heart
                  onClick={() => likeMutation.mutate(id)}
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
                  src={getMediaUrl(user.profile)}
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
                onClick={() => commentMutation.mutate(newComment)}
                disabled={commentMutation.isPending || !newComment.trim()}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
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
                        src={getMediaUrl(comment.user.profile)}
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
