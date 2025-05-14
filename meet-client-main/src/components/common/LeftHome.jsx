import { Compass, Heart, HomeIcon, LogOut, PlusSquare } from "lucide-react";
import DropDown from "./DropDown";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userSelectorState } from "../../store/selector/userSelctor";
import { Button } from "@/components/ui/button";

const LeftHome = () => {
  const user = useRecoilValue(userSelectorState);
  const setUser = useSetRecoilState(userSelectorState);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({ user: {}, token: null });
    navigate("/login");
  };

  return (
    <div className="sticky top-4 left-0 hidden lg:flex flex-col items-start lg:w-1/6 bg-white m-3 p-4 rounded-lg shadow-lg h-[97vh]">
      <Link
        to="/"
        className="flex items-center gap-3 mb-6 w-full cursor-pointer hover:bg-blue-500 py-2 px-3 hover:text-white rounded-lg transition-all duration-200"
      >
        <HomeIcon />
        <p className="text-xl font-semibold">Home</p>
      </Link>
      <Link
        to="/explore"
        className="flex items-center gap-3 mb-6 w-full cursor-pointer hover:bg-blue-500 py-2 px-3 hover:text-white rounded-lg transition-all duration-200"
      >
        <Compass />
        <p className="text-xl font-semibold">Explore</p>
      </Link>
      <Link
        to="/notification"
        className="flex items-center gap-3 mb-6 w-full cursor-pointer hover:bg-blue-500 py-2 px-3 hover:text-white rounded-lg transition-all duration-200"
      >
        <Heart />
        <p className="text-xl font-semibold">Notification</p>
      </Link>
      <Link
        to="/upload"
        className="flex items-center gap-3 mb-6 w-full cursor-pointer hover:bg-blue-500 py-2 px-3 hover:text-white rounded-lg transition-all duration-200"
      >
        <PlusSquare />
        <p className="text-xl font-semibold">Create</p>
      </Link>
      <Link
        to={`/profile/${user._id}`}
        className="flex items-center gap-3 mb-6 w-full cursor-pointer hover:bg-blue-500 py-2 px-3 hover:text-white rounded-lg transition-all duration-200"
      >
        <Avatar>
          <AvatarImage src={user.profile} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <p className="text-xl font-semibold">Profile</p>
      </Link>
      <div className="mt-auto w-full">
        <div className="flex items-center w-full gap-3 mb-4">
          <DropDown />
        </div>
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default LeftHome;
