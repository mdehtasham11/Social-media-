import LeftHome from "../components/common/LeftHome";
import RightHome from "../components/common/RightHome";
import MobileMenu from "../components/common/MobileMenu";
import UploadGrid from "../components/common/UploadGrid";

const Create = () => {
  return (
    <div className="relative flex flex-col lg:flex-row bg-gray-50 h-screen">
      <LeftHome />
      <UploadGrid />
      <RightHome />
      <MobileMenu />
    </div>
  );
}

export default Create