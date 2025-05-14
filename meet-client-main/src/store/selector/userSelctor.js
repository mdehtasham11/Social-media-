import { selector } from "recoil";
import { userAtomState } from "../atoms/userAtom";

export const userSelectorState = selector({
  key: "userSelector",
  get: ({ get }) => {
    const user = get(userAtomState);
    return user;
  },
  set: ({ set }, newUserData) => {
    const { user, token } = newUserData;
    console.log(user, token);
    set(userAtomState, user);
    localStorage.setItem("user", JSON.stringify(user));
    if(token) localStorage.setItem("token", token);
  },
});
