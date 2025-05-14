import { atom } from "recoil";

export const userAtomState = atom({
 key: 'userAtom',
 default: JSON.parse(localStorage.getItem("user"))|| {},
});