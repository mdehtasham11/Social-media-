import Feed from "../components/common/Feed";
import LeftHome from "../components/common/LeftHome";
import MobileMenu from "../components/common/MobileMenu";
import RightHome from "../components/common/RightHome";

const Home = () => {

  return (
    <div className="relative flex flex-col lg:flex-row bg-gray-50 h-screen">
      <LeftHome/>
      <Feed />
      <RightHome />
      <MobileMenu />
    </div>
  );
};

export default Home;
