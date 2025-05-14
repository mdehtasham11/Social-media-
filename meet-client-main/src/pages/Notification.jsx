import LeftHome from "../components/common/LeftHome";
import MobileMenu from "../components/common/MobileMenu";
import RightHome from "../components/common/RightHome";
import NotificationGrid from "../components/common/NotificationGrid";

const Notification = () => {
  return (
    <div className="relative flex flex-col lg:flex-row bg-gray-50 h-screen">
      <LeftHome />
      <NotificationGrid /> 
      <RightHome />
      <MobileMenu />
    </div>
  )
}

export default Notification