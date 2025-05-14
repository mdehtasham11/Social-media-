
import LeftHome from "../components/common/LeftHome";
import MobileMenu from "../components/common/MobileMenu";
import RightHome from "../components/common/RightHome";
import SinglePostD from "../components/common/SinglePost";
const SinglePost = () => {
  return (
    <div className="relative flex flex-col lg:flex-row bg-gray-50 h-screen">
      <LeftHome />
      <SinglePostD />
      <RightHome />
      <MobileMenu />
    </div>
  );
};

export default SinglePost;
