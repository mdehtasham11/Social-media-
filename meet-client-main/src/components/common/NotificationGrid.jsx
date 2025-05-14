import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { handleDate } from "../../functions/dateFormat";

const NotificationGrid = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleGetNotification = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/notification/`,
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
      const { data } = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetNotification();
  }, []);

  const renderIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="text-red-500" />;
      case "comment":
        return <MessageCircle className="text-blue-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-24 h-4 mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-48 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm"
            >
              <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                <AvatarImage src="" alt="jdbjhdf" />
                <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
                  S
                </AvatarFallback>
              </Avatar>
              <Link to={`/post/${notification.post}`}>
                <div className="flex-1">
                  <p className="text-lg font-semibold">Someone</p>
                  <div className="flex items-center gap-3">
                    <div>{renderIcon(notification.type)}</div>
                    <p className="text-gray-500">
                      {notification.type === "like" ? "Liked" : "Commented"}{" "}
                      {notification.type === "like" ? "" : "on"} your post{" "}
                      {handleDate(notification.createdAt)} ago
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationGrid;
