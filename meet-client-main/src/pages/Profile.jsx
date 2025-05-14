import RightHome from '../components/common/RightHome';
import LeftHome from '../components/common/LeftHome'
import ProfileGrid from '../components/common/ProfileGrid';
import MobileMenu from '../components/common/MobileMenu';

const Profile = () => {

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <LeftHome />
      <ProfileGrid />
      <RightHome />
      <MobileMenu />
    </div>

  );
};

export default Profile;
