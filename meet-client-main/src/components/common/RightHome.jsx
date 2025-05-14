import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { userSelectorState } from "../../store/selector/userSelctor";
import { useRecoilValue } from "recoil";

const RightHome = () => {
  const [people, setPeople] = useState([]);
  const [addedFriend, setAddedFriend] = useState(false);
  const user = useRecoilValue(userSelectorState);

  const handleGetPeople = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/people`,
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
      const peopleData = await response.json();
      setPeople(peopleData.data);
    } catch (error) {
      toast.error("Internal server error");
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
      setAddedFriend(!addedFriend);
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  useEffect(() => {
    handleGetPeople();
  }, [addedFriend, user]);
  return (
    <>
      <Toaster position="top-right" duration="4000" />
      <div className="sticky top-4 right-0 hidden lg:flex flex-col items-start lg:w-1/5 bg-white m-3 p-4 rounded-lg shadow-lg h-[97vh]">
        <div className="flex items-start gap-4 mb-6 w-full cursor-pointer">
          <Avatar className="relative w-12 h-12 rounded-full overflow-hidden">
            <AvatarImage
              src={user.profile}
              alt="@shadcn"
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
              CN
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">{user.userName}</p>
            <p className="text-base font-semibold">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <p className="text-base font-semibold">Suggested Friends</p>
          <p className="text-blue-500 cursor-pointer hover:underline">
            See all
          </p>
        </div>
        {people.length > 0 ? (
          <div className="mt-6 w-full">
            {people &&
              people.map((item) => (
                <div
                  className="flex items-center justify-between w-full mb-4"
                  key={item._id}
                >
                  <Link to={`/profile/${item._id}`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="relative w-8 h-8 rounded-full overflow-hidden">
                        <AvatarImage
                          src={item.profile || "https://github.com/shadcn.png"}
                          alt={item.userName || "@shadcn"}
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-700">
                          {item.userName
                            ? item.userName[0].toUpperCase()
                            : "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold">{item.userName}</p>
                    </div>
                  </Link>
                  <Button
                    onClick={() => {
                      handleAddFriends(item._id);
                    }}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            <p className="text-blue-500">See All</p>
          </div>
        ) : (
          <div className="mt-6 w-full">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex gap-5 items-center w-full mb-4">
                <Skeleton className="h-10 w-[15%] rounded-full" />
                <Skeleton className="h-5 w-[50%]" />
                <Skeleton className="h-10 w-[35%]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RightHome;
