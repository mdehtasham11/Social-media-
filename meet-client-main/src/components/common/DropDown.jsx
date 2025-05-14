import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import FriendList from "./FriendList";

const DropDown = ({friend, id}) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <p className="font-semibold text-lg cursor-pointer">{friend}</p>
      </DrawerTrigger>
      <DrawerContent>
       <FriendList userId={id}/>
      </DrawerContent>
    </Drawer>
  );
};

export default DropDown;
