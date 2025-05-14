import LeftHome from "../components/common/LeftHome"
import MobileMenu from "../components/common/MobileMenu"
import RightHome from "../components/common/RightHome"
import ExploreGrid from "../components/common/ExploreGrid"

const Explore = () => {
  return (
    <div className="relative flex flex-col lg:flex-row bg-gray-50 h-screen">
      <LeftHome />
      <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-4 px-4 mb-20 md:mb-20 lg:px-5 rounded-lg shadow-lg overflow-y-auto no-scrollbar">
        <ExploreGrid />
      </div>
      <RightHome />
      <MobileMenu />
    </div>
  )
}

export default Explore